import React, { useEffect, useRef, useState } from 'react';
import { Alert, Image, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, apiGet, API_BASE_KEY, getApiBase, setApiBase, TOKEN_KEY, LAST_PUSH_KEY } from './src/api';
import { flushLocations, startTracking, stopTracking } from './src/locationTask';

type Screen = 'login' | 'home' | 'camera';
type Mode = 'checkin' | 'checkout';
type Tab = 'home' | 'jobs' | 'history' | 'profile';
type LoginRes = { token: string; employee: { id: string; name: string } };
type CheckRes = { session_id: string; status: string };
type HistoryItem = { id:string; status:string; check_in_at:string; check_out_at?:string; check_in_photo_url?:string; check_out_photo_url?:string; last_ping_at?:string };
type PendingPhoto = { uri:string; base64:string };
type JobItem = { id:string; wo_no:string; date:string; customer_name:string; vehicle:string; vehicle_plate:string; complaint:string; status:string; total:number };

const EMPLOYEE_KEY = 'sidomulyo_employee';
const ACTIVE_SESSION_KEY = 'sidomulyo_active_session_id';

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [mode, setMode] = useState<Mode>('checkin');
  const [apiBase, setApiBaseState] = useState('http://localhost:3000');
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [employee, setEmployee] = useState<{ id: string; name: string } | null>(null);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [pendingPhoto, setPendingPhoto] = useState<PendingPhoto | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [pushCountdown, setPushCountdown] = useState(60);
  const [tab, setTab] = useState<Tab>('home');
  const [lastPushTime, setLastPushTime] = useState<number>(Date.now());
  const cameraRef = useRef<CameraView>(null);
  const webTrackRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [camPerm, requestCamPerm] = useCameraPermissions();

  useEffect(() => { boot(); }, []);

  useEffect(() => {
    if (!activeSession) return;
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastPushTime) / 1000);
      const remaining = Math.max(0, 30 - elapsed);
      setPushCountdown(remaining);
      if (remaining === 0 && elapsed < 31) {
        console.log('[attendance] PUSH INTERVAL TICK - should send location now');
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [activeSession, lastPushTime]);

  // Force start web tracking when session becomes active
  useEffect(() => {
    if (activeSession && Platform.OS === 'web') {
      console.log('[attendance] useEffect detected activeSession, starting tracking:', activeSession);
      startWebTracking(activeSession);
    }
    return () => {
      if (Platform.OS === 'web') stopWebTracking();
    };
  }, [activeSession]);


  async function boot() {
    const savedBase = await AsyncStorage.getItem(API_BASE_KEY);
    if (savedBase) setApiBaseState(savedBase);
    const rawEmp = await AsyncStorage.getItem(EMPLOYEE_KEY);
    const sid = await AsyncStorage.getItem(ACTIVE_SESSION_KEY);
    if (rawEmp) { 
      const emp=JSON.parse(rawEmp); 
      setEmployee(emp); 
      setActiveSession(sid); 
      setScreen('home'); 
      reconcileActiveSession(emp.id, sid).catch(()=>{});
      loadJobs(emp.name).catch(()=>{});
    }
    const savedLastPush = await AsyncStorage.getItem(LAST_PUSH_KEY);
    if (savedLastPush) setLastPushTime(parseInt(savedLastPush));
    flushLocations().catch(() => {});
  }

  async function login() {
    try {
      setBusy(true);
      await setApiBase(apiBase);
      const data = await api<LoginRes>('/api/mobile/login', { username, pin });
      await AsyncStorage.setItem(TOKEN_KEY, data.token);
      await AsyncStorage.setItem(EMPLOYEE_KEY, JSON.stringify(data.employee));
      setEmployee(data.employee);
      loadHistory(data.employee.id).catch(()=>{});
      loadJobs(data.employee.name).catch(()=>{});
      setScreen('home');
    } catch (e: any) { Alert.alert('Login gagal', e.message); }
    finally { setBusy(false); }
  }

  async function loadJobs(empName = employee?.name) {
    if (!empName) return;
    try {
      const data = await api<JobItem[]>('/api/mobile/mechanic-jobs', { name: empName });
      setJobs(data);
    } catch (e) {
      console.error('[attendance] Gagal memuat pekerjaan:', e);
    }
  }


  function stopWebTracking() {
    if (webTrackRef.current) clearInterval(webTrackRef.current);
    webTrackRef.current = null;
  }

  function startWebTracking(sessionId: string) {
    stopWebTracking();
    console.log('[attendance] startWebTracking:', sessionId);
    const push = async () => {
      try {
        console.log('[attendance] push start');
        const loc = await currentLocation();
        console.log('[attendance] location obtained:', {lat:loc.coords.latitude, lng:loc.coords.longitude, acc:loc.coords.accuracy});
        const res = await api('/api/attendance/location', {
          session_id: sessionId,
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
          accuracy: loc.coords.accuracy,
          recorded_at: new Date().toISOString(),
        });
        console.log('[attendance] push ok:', res);
        const now = Date.now();
        setLastPushTime(now);
        await AsyncStorage.setItem(LAST_PUSH_KEY, now.toString());
      } catch (e: any) { 
        console.error('[attendance] push error:', e.message);
      }
    };
    push().catch(e => console.error('[attendance] first push failed:', e.message));
    webTrackRef.current = setInterval(push, 30000);
  }

  async function openCamera(nextMode: Mode) {
    if (!camPerm?.granted) {
      const res = await requestCamPerm();
      if (!res.granted) return Alert.alert('Kamera wajib', 'Absen harus memakai foto langsung dari kamera.');
    }
    setMode(nextMode);
    setPhotoUri(null);
    setPendingPhoto(null);
    setScreen('camera');
  }

  async function takePhoto() {
    const p = await cameraRef.current?.takePictureAsync({ quality: 0.65, base64: true, exif: false });
    if (!p?.uri || !p.base64) return;
    setPhotoUri(p.uri);
    setPendingPhoto({ uri:p.uri, base64:p.base64 });
  }

  async function currentLocation() {
    const fg = await Location.requestForegroundPermissionsAsync();
    if (fg.status !== 'granted') throw new Error('Izin lokasi ditolak');
    return Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
  }

  async function confirmPhoto() {
    if (!pendingPhoto) return;
    await submitPhoto(pendingPhoto.base64);
  }

  function retakePhoto() {
    setPhotoUri(null);
    setPendingPhoto(null);
  }

  async function loadHistory(employeeId = employee?.id) {
    const qs = employeeId ? `?employee_id=${encodeURIComponent(employeeId)}` : '';
    const data = await apiGet<HistoryItem[]>(`/api/attendance/history${qs}`);
    setHistory(data.slice(0,5));
    const active = data.find(x=>x.status==='ACTIVE');
    if (active?.id) { setActiveSession(active.id); setCheckInTime(active.check_in_at); await AsyncStorage.setItem(ACTIVE_SESSION_KEY, active.id); }
    else { setActiveSession(null); setCheckInTime(null); await AsyncStorage.removeItem(ACTIVE_SESSION_KEY); stopWebTracking(); await stopTracking().catch(()=>{}); }
  }

  async function reconcileActiveSession(employeeId: string, localSession: string | null) {
    await loadHistory(employeeId);
    if (employee?.name) await loadJobs(employee.name);
  }

  async function submitPhoto(base64: string) {
    try {
      setBusy(true);
      const loc = await currentLocation();
      const payload = {
        employee_id: employee?.id,
        photo_base64: base64,
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
        accuracy: loc.coords.accuracy,
      };
      if (mode === 'checkin') {
        const data = await api<CheckRes>('/api/attendance/checkin', payload);
        console.log('[attendance] checkin API response:', data);
        await AsyncStorage.setItem(ACTIVE_SESSION_KEY, data.session_id);
        setActiveSession(data.session_id);
        setCheckInTime(new Date().toISOString());
        const now = Date.now();
        setLastPushTime(now);
        await AsyncStorage.setItem(LAST_PUSH_KEY, now.toString());
        setPendingPhoto(null);
        setPhotoUri(null);
        setScreen('home');
        console.log('[attendance] Platform.OS:', Platform.OS);
        if (Platform.OS === 'web') {
          console.log('[attendance] calling startWebTracking');
          startWebTracking(data.session_id);
        } else {
          console.log('[attendance] calling native startTracking');
          await startTracking(data.session_id);
        }
        Alert.alert('Absen masuk berhasil', Platform.OS === 'web' ? 'Live lokasi aktif selama tab ini terbuka.' : 'Live lokasi aktif.');
      } else {
        if (!activeSession) throw new Error('Tidak ada sesi aktif');
        await api<CheckRes>('/api/attendance/checkout', { ...payload, session_id: activeSession });
        stopWebTracking();
        if (Platform.OS !== 'web') await stopTracking();
        await AsyncStorage.multiRemove([ACTIVE_SESSION_KEY, LAST_PUSH_KEY]);
        setActiveSession(null);
        setCheckInTime(null);
        setPendingPhoto(null);
        setPhotoUri(null);
        setLastPushTime(Date.now());
        setPushCountdown(30);
        setTab('home');
        setScreen('home');
        Alert.alert('Absen pulang berhasil', 'Live lokasi dihentikan.');
      }
      setScreen('home');
    } catch (e: any) { Alert.alert('Gagal', e.message); }
    finally { setBusy(false); }
  }

  async function logout() {
    if (activeSession && checkInTime) return Alert.alert('Masih absen', 'Absen keluar dulu sebelum logout. Kalau status nyangkut, tekan Refresh Status.');
    stopWebTracking();
    await stopTracking().catch(()=>{});
    await AsyncStorage.multiRemove([TOKEN_KEY, EMPLOYEE_KEY, ACTIVE_SESSION_KEY]);
    setEmployee(null); setActiveSession(null); setCheckInTime(null); setHistory([]); setScreen('login');
  }

  if (screen === 'login') return <SafeAreaView style={s.loginWrap}><ScrollView contentContainerStyle={s.loginCenter}>
    <View style={s.loginBox}>
      <View style={s.loginLogo}><Text style={s.loginLogoText}>SM</Text></View>
      <Text style={s.loginTitle}>Sidomulyo Attendance</Text>
      <Text style={s.loginSub}>Absensi karyawan dengan foto live & GPS realtime</Text>
      <View style={s.loginFields}>
        <Text style={s.inputLabel}>Server API</Text>
        <TextInput style={s.cleanInput} value={apiBase} onChangeText={setApiBaseState} placeholder="http://localhost:3000" autoCapitalize="none"/>
        <Text style={s.inputLabel}>ID Karyawan</Text>
        <TextInput style={s.cleanInput} value={username} onChangeText={setUsername} placeholder="EMP-001" autoCapitalize="none"/>
        <Text style={s.inputLabel}>PIN</Text>
        <TextInput style={s.cleanInput} value={pin} onChangeText={setPin} placeholder="Masukkan PIN" secureTextEntry keyboardType="number-pad"/>
      </View>
      <TouchableOpacity disabled={busy} onPress={login} style={[s.loginBtn,busy&&s.loginBtnDisabled]}><Text style={s.loginBtnText}>{busy?'Memproses...':'Masuk'}</Text></TouchableOpacity>
    </View>
  </ScrollView></SafeAreaView>;

  if (screen === 'camera') return <View style={s.cameraWrap}>{photoUri ? <Image source={{uri:photoUri}} style={s.camera}/> : <CameraView ref={cameraRef} style={s.camera} facing="front"/>}<SafeAreaView style={s.cameraBar}><Text style={s.cameraTitle}>{mode==='checkin'?'Foto Absen Masuk':'Foto Absen Pulang'}</Text><Text style={s.muted}>{photoUri?'Cek foto dulu. Kalau blur, retake.':'Pastikan wajah terang & jelas.'}</Text>{photoUri ? <><Btn text={busy?'Mengirim...':'Pakai Foto Ini'} onPress={confirmPhoto}/><Btn text="Retake Foto" variant="ghost" onPress={retakePhoto}/></> : <Btn text="Ambil Foto Live" onPress={takePhoto}/>}<Btn text="Batal" variant="ghost" onPress={()=>setScreen('home')}/></SafeAreaView></View>;

  const todayItem = history[0];
  const alreadyCheckedOutToday = !!todayItem && !activeSession && (todayItem.status === 'CLOSED' || todayItem.status === 'CHECKOUT');
  const homeStatusTitle = activeSession ? 'Sedang Absen' : alreadyCheckedOutToday ? 'Sudah Pulang' : 'Belum Check-in';
  const homeStatusChip = activeSession ? 'ACTIVE' : alreadyCheckedOutToday ? 'CHECKOUT' : 'OFF';
  const displayCheckIn = activeSession ? checkInTime : todayItem?.check_in_at;
  const displayCheckOut = alreadyCheckedOutToday ? todayItem?.check_out_at : null;
  const content = tab === 'history' ? <>
    <View style={s.pageHeader}><Text style={s.pageTitle}>Riwayat Absensi</Text><Text style={s.pageSub}>Catatan masuk, pulang, dan status harian.</Text></View>
    <View style={s.searchBox}><Text style={s.searchIcon}>⌕</Text><Text style={s.searchText}>Cari tanggal / status</Text></View>
    <View style={s.listCard}>{history.length?history.map(x=><View key={x.id} style={s.historyRow}>
      <View style={s.dateBadge}><Text style={s.dateDay}>{dayNum(x.check_in_at)}</Text><Text style={s.dateMon}>{monName(x.check_in_at)}</Text></View>
      <View style={{flex:1}}><View style={s.rowTop}><Text style={s.rowTitle}>{statusText(x.status)}</Text><StatusChip status={x.status}/></View><Text style={s.rowMeta}>Masuk  {fmtTime(x.check_in_at)}</Text><Text style={s.rowMeta}>Pulang {fmtTime(x.check_out_at)}</Text></View>
    </View>):<Text style={s.emptyText}>Belum ada riwayat.</Text>}</View>
  </> : tab === 'jobs' ? <>
    <View style={s.pageHeader}><Text style={s.pageTitle}>Pekerjaan Saya</Text><Text style={s.pageSub}>Daftar unit kendaraan yang Anda tangani.</Text></View>
    <View style={s.listCard}>{jobs.length?jobs.map(x=><View key={x.id} style={[s.historyRow, {paddingVertical:16}]}>
      <View style={{flex:1}}>
        <View style={s.rowTop}>
          <Text style={[s.rowTitle, {color:'#1A73E8'}]}>{x.wo_no}</Text>
          <Text style={[s.chip, x.status==='SELESAI'||x.status.startsWith('INVOICED')?s.chipLive:s.chipWarn]}>{x.status}</Text>
        </View>
        <Text style={[s.rowMeta, {fontSize:15, color:'#111827', fontWeight:'800', marginTop:6}]}>{x.customer_name} · <Text style={{color:'#6B7280'}}>{x.vehicle} ({x.vehicle_plate})</Text></Text>
        <Text style={[s.rowMeta, {marginTop:4, color:'#374151', fontStyle:'italic'}]}>Keluhan: {x.complaint||'-'}</Text>
        <Text style={[s.rowMeta, {fontSize:11, color:'#9CA3AF', marginTop:6}]}>Tanggal: {fmt(x.date)}</Text>
      </View>
    </View>):<Text style={s.emptyText}>Belum ada daftar pekerjaan yang ditugaskan ke Anda.</Text>}</View>
  </> : tab === 'profile' ? <>
    <View style={s.profileHero}><View style={s.avatar}><Text style={s.avatarText}>{employee?.name?.slice(0,1)||'K'}</Text></View><Text style={s.profileName}>{employee?.name}</Text><Text style={s.profileId}>{employee?.id}</Text></View>
    <View style={s.profileList}>
      <ProfileRow title="Status sesi" value={activeSession?'Aktif':'Tidak aktif'}/>
      <ProfileRow title="Session ID" value={activeSession||'-'}/>
      <ProfileRow title="Server API" value={apiBase}/>
      <ProfileRow title="Refresh status & pekerjaan" value="Perbarui" onPress={()=>Promise.all([loadHistory(), loadJobs()]).then(()=>Alert.alert('OK','Data berhasil disegarkan'))}/>
      <ProfileRow title="Sync lokasi tertunda" value="Kirim sekarang" onPress={()=>flushLocations().then(()=>Alert.alert('OK','Sync selesai'))}/>
    </View>
    <TouchableOpacity style={s.logoutBtn} onPress={logout}><Text style={s.logoutText}>Logout</Text></TouchableOpacity>
  </> : <>
    <View style={s.homeHero}><View><Text style={s.greeting}>Selamat bekerja,</Text><Text style={s.homeName}>{employee?.name}</Text></View><TouchableOpacity style={s.refreshCircle} onPress={()=>Promise.all([loadHistory(), loadJobs()]).then(()=>Alert.alert('OK','Status disegarkan'))}><Text style={s.refreshText}>↻</Text></TouchableOpacity></View>
    <View style={s.attendanceCard}><View style={s.cardTop}><Text style={s.cardLabel}>Status hari ini</Text><StatusChip status={homeStatusChip}/></View><Text style={s.bigStatus}>{homeStatusTitle}</Text><View style={s.timeGrid}><View><Text style={s.timeLabel}>Masuk</Text><Text style={s.timeValue}>{fmtTime(displayCheckIn)}</Text></View><View><Text style={s.timeLabel}>Pulang</Text><Text style={s.timeValue}>{fmtTime(displayCheckOut)}</Text></View></View>{activeSession&&<View style={s.nextPush}><Text style={s.nextPushLabel}>Push lokasi berikutnya</Text><Text style={s.nextPushValue}>{pushCountdown}s</Text></View>}</View>
    <View style={s.punchGrid}><TouchableOpacity disabled={(!!activeSession && !!checkInTime) || alreadyCheckedOutToday || busy} onPress={()=>openCamera('checkin')} style={[s.punchCard,((!!activeSession && !!checkInTime)||alreadyCheckedOutToday)&&s.punchDisabled]}><Text style={s.punchIcon}>↗</Text><Text style={s.punchTitle}>Check In</Text><Text style={s.punchSub}>Foto live + GPS</Text></TouchableOpacity><TouchableOpacity disabled={(!activeSession || !checkInTime) || busy} onPress={()=>openCamera('checkout')} style={[s.punchCard,s.punchOut,((!activeSession || !checkInTime)||busy)&&s.punchDisabled]}><Text style={s.punchIcon}>↘</Text><Text style={s.punchTitle}>Check Out</Text><Text style={s.punchSub}>Akhiri sesi</Text></TouchableOpacity></View>
    <View style={s.summaryCard}><Text style={s.summaryTitle}>Riwayat terakhir</Text>{todayItem?<View style={s.miniHistory}><StatusChip status={todayItem.status}/><View><Text style={s.rowMeta}>Masuk {fmtTime(todayItem.check_in_at)}</Text><Text style={s.rowMeta}>Pulang {fmtTime(todayItem.check_out_at)}</Text></View></View>:<Text style={s.emptyText}>Belum ada riwayat.</Text>}</View>
  </>;

  return <SafeAreaView style={s.appWrap}><View style={s.appShell}><ScrollView contentContainerStyle={s.appContent}>{content}</ScrollView><View style={s.bottomNav}><NavItem label="Beranda" icon="⌂" active={tab==='home'} onPress={()=>setTab('home')}/><NavItem label="Pekerjaan" icon="⚒" active={tab==='jobs'} onPress={()=>setTab('jobs')}/><NavItem label="Riwayat" icon="◴" active={tab==='history'} onPress={()=>setTab('history')}/><NavItem label="Profil" icon="○" active={tab==='profile'} onPress={()=>setTab('profile')}/></View></View></SafeAreaView>;
}

function fmt(t?: string | null) { if(!t) return '-'; try { return new Date(t).toLocaleString('id-ID',{dateStyle:'short',timeStyle:'short'}); } catch { return t; } }
function RemotePhoto({ path }: { path: string }) { const [base,setBase]=React.useState(''); React.useEffect(()=>{ getApiBase().then(setBase); },[]); return <Image source={{uri: base+path}} style={s.histPhoto}/>; }

function fmtTime(t?: string | null) { if(!t) return '-'; try { return new Date(t).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'}); } catch { return '-'; } }
function dayNum(t?: string | null) { if(!t) return '--'; try { return String(new Date(t).getDate()).padStart(2,'0'); } catch { return '--'; } }
function monName(t?: string | null) { if(!t) return '---'; try { return new Date(t).toLocaleDateString('id-ID',{month:'short'}); } catch { return '---'; } }
function statusText(status?: string) { return status==='ACTIVE' ? 'Sedang Check-in' : status==='CHECKOUT' ? 'Selesai' : status || 'Tidak Hadir'; }
function StatusChip({ status }: { status?: string }) { const live=status==='ACTIVE'; const done=status==='CHECKOUT'; const off=status==='OFF'; return <Text style={[s.chip, live?s.chipLive:done?s.chipDone:off?s.chipOff:s.chipWarn]}>{live?'Hadir':done?'Selesai':off?'OFF':status||'Tidak Hadir'}</Text>; }
function NavItem({label,icon,active,onPress}:{label:string;icon:string;active:boolean;onPress:()=>void}){return <TouchableOpacity onPress={onPress} style={s.navItem}><Text style={[s.navIcon,active&&s.navActive]}>{icon}</Text><Text style={[s.navLabel,active&&s.navActive]}>{label}</Text></TouchableOpacity>}
function ProfileRow({title,value,onPress}:{title:string;value:string;onPress?:()=>void}){const Inner=<><Text style={s.profileRowTitle}>{title}</Text><View style={{flex:1}}/><Text numberOfLines={1} style={s.profileRowValue}>{value}</Text><Text style={s.chev}>›</Text></>; return onPress?<TouchableOpacity style={s.profileRow} onPress={onPress}>{Inner}</TouchableOpacity>:<View style={s.profileRow}>{Inner}</View>}

function Btn({ text, onPress, disabled, variant='solid' }: { text: string; onPress: () => void; disabled?: boolean; variant?: 'solid'|'ghost' }) {
  return <TouchableOpacity disabled={disabled} onPress={onPress} style={[s.btn, variant==='ghost' && s.ghost, disabled && s.disabled]}><Text style={[s.btnText, variant==='ghost' && s.ghostText, disabled && s.disabledText]}>{text}</Text></TouchableOpacity>;
}

const s = StyleSheet.create({
  loginWrap:{flex:1,backgroundColor:'#F4F8FF'},
  loginCenter:{flexGrow:1,justifyContent:'center',padding:24,alignItems:'center'},
  loginBox:{width:'100%',maxWidth:420,backgroundColor:'#FFFFFF',borderRadius:28,padding:26,shadowColor:'#0F172A',shadowOpacity:.12,shadowRadius:28},
  loginLogo:{width:68,height:68,borderRadius:22,backgroundColor:'#1A73E8',alignItems:'center',justifyContent:'center',alignSelf:'center',marginBottom:18},
  loginLogoText:{color:'#FFFFFF',fontSize:24,fontWeight:'900'},
  loginTitle:{fontSize:28,fontWeight:'900',color:'#111827',textAlign:'center'},
  loginSub:{color:'#6B7280',fontWeight:'600',textAlign:'center',lineHeight:20,marginTop:8},
  loginFields:{marginTop:24,gap:8},
  inputLabel:{color:'#374151',fontWeight:'800',fontSize:12,marginTop:8},
  cleanInput:{backgroundColor:'#F9FAFB',borderWidth:1,borderColor:'#E5E7EB',borderRadius:16,padding:15,fontSize:16,color:'#111827'},
  loginBtn:{backgroundColor:'#1A73E8',borderRadius:16,padding:16,alignItems:'center',marginTop:24},
  loginBtnDisabled:{opacity:.6},
  loginBtnText:{color:'#FFFFFF',fontWeight:'900',fontSize:16},

  appWrap:{flex:1,backgroundColor:'#F4F8FF'},
  appShell:{flex:1,width:'100%',maxWidth:520,alignSelf:'center'},
  appContent:{padding:20,paddingBottom:106,gap:16},
  homeHero:{backgroundColor:'#1A73E8',borderRadius:28,padding:22,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
  greeting:{color:'rgba(255,255,255,.78)',fontWeight:'700'},
  homeName:{color:'#FFFFFF',fontSize:28,fontWeight:'900',marginTop:4},
  refreshCircle:{width:46,height:46,borderRadius:16,backgroundColor:'rgba(255,255,255,.18)',alignItems:'center',justifyContent:'center'},
  refreshText:{color:'#FFFFFF',fontSize:24,fontWeight:'900'},
  attendanceCard:{backgroundColor:'#FFFFFF',borderRadius:28,padding:20,shadowColor:'#0F172A',shadowOpacity:.06,shadowRadius:18},
  cardTop:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
  cardLabel:{color:'#6B7280',fontWeight:'800',fontSize:12,textTransform:'uppercase',letterSpacing:.6},
  bigStatus:{fontSize:25,fontWeight:'900',color:'#111827',marginTop:12},
  timeGrid:{flexDirection:'row',justifyContent:'space-between',backgroundColor:'#F9FAFB',borderRadius:20,padding:16,marginTop:16},
  timeLabel:{color:'#6B7280',fontWeight:'800',fontSize:12},
  timeValue:{color:'#111827',fontWeight:'900',fontSize:20,marginTop:4},
  nextPush:{marginTop:14,backgroundColor:'#ECFDF5',borderRadius:18,padding:14,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
  nextPushLabel:{color:'#047857',fontWeight:'800'},
  nextPushValue:{color:'#047857',fontWeight:'900',fontSize:26},
  punchGrid:{flexDirection:'row',gap:14},
  punchCard:{flex:1,backgroundColor:'#28A745',borderRadius:26,padding:18,minHeight:136,justifyContent:'space-between'},
  punchOut:{backgroundColor:'#F97316'},
  punchDisabled:{backgroundColor:'#D1D5DB'},
  punchIcon:{color:'#FFFFFF',fontWeight:'900',fontSize:26},
  punchTitle:{color:'#FFFFFF',fontWeight:'900',fontSize:21},
  punchSub:{color:'rgba(255,255,255,.86)',fontWeight:'700',fontSize:12},
  summaryCard:{backgroundColor:'#FFFFFF',borderRadius:24,padding:18},
  summaryTitle:{color:'#111827',fontWeight:'900',fontSize:18,marginBottom:12},
  miniHistory:{flexDirection:'row',gap:12,alignItems:'center'},

  pageHeader:{paddingTop:4},
  pageTitle:{color:'#111827',fontSize:28,fontWeight:'900'},
  pageSub:{color:'#6B7280',fontWeight:'600',marginTop:6},
  searchBox:{backgroundColor:'#FFFFFF',borderRadius:18,padding:16,flexDirection:'row',gap:10,alignItems:'center'},
  searchIcon:{color:'#6B7280',fontSize:18,fontWeight:'900'},
  searchText:{color:'#9CA3AF',fontWeight:'700'},
  listCard:{backgroundColor:'#FFFFFF',borderRadius:26,padding:8},
  historyRow:{flexDirection:'row',gap:14,padding:14,borderBottomWidth:1,borderBottomColor:'#F3F4F6'},
  dateBadge:{width:56,height:64,borderRadius:18,backgroundColor:'#EFF6FF',alignItems:'center',justifyContent:'center'},
  dateDay:{color:'#1A73E8',fontSize:20,fontWeight:'900'},
  dateMon:{color:'#1A73E8',fontSize:12,fontWeight:'800',textTransform:'uppercase'},
  rowTop:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:8},
  rowTitle:{color:'#111827',fontWeight:'900',fontSize:16},
  rowMeta:{color:'#6B7280',fontWeight:'700',fontSize:13,marginTop:5},
  emptyText:{color:'#6B7280',fontWeight:'700',padding:16},

  profileHero:{backgroundColor:'#1A73E8',borderRadius:30,padding:26,alignItems:'center'},
  avatar:{width:82,height:82,borderRadius:28,backgroundColor:'#FFFFFF',alignItems:'center',justifyContent:'center',marginBottom:14},
  avatarText:{color:'#1A73E8',fontSize:34,fontWeight:'900'},
  profileName:{color:'#FFFFFF',fontSize:26,fontWeight:'900'},
  profileId:{color:'rgba(255,255,255,.78)',fontWeight:'800',marginTop:4},
  profileList:{backgroundColor:'#FFFFFF',borderRadius:26,padding:8},
  profileRow:{flexDirection:'row',alignItems:'center',gap:10,padding:15,borderBottomWidth:1,borderBottomColor:'#F3F4F6'},
  profileRowTitle:{color:'#111827',fontWeight:'800'},
  profileRowValue:{color:'#6B7280',fontWeight:'700',maxWidth:190},
  chev:{color:'#9CA3AF',fontSize:22,fontWeight:'900'},
  logoutBtn:{backgroundColor:'#DC3545',borderRadius:18,padding:16,alignItems:'center'},
  logoutText:{color:'#FFFFFF',fontWeight:'900',fontSize:16},

  chip:{overflow:'hidden',borderRadius:999,paddingVertical:6,paddingHorizontal:10,fontSize:12,fontWeight:'900'},
  chipLive:{backgroundColor:'#DCFCE7',color:'#15803D'},
  chipDone:{backgroundColor:'#DBEAFE',color:'#1D4ED8'},
  chipOff:{backgroundColor:'#E5E7EB',color:'#374151'},
  chipWarn:{backgroundColor:'#FEF3C7',color:'#B45309'},
  bottomNav:{position:'absolute',left:16,right:16,bottom:16,backgroundColor:'#FFFFFF',borderRadius:26,paddingVertical:10,paddingHorizontal:8,flexDirection:'row',justifyContent:'space-around',shadowColor:'#0F172A',shadowOpacity:.12,shadowRadius:18},
  navItem:{alignItems:'center',gap:3,minWidth:65},
  navIcon:{color:'#9CA3AF',fontWeight:'900',fontSize:21},
  navLabel:{color:'#9CA3AF',fontWeight:'800',fontSize:12},
  navActive:{color:'#1A73E8'},

  cameraWrap:{flex:1,backgroundColor:'#000'},
  camera:{flex:1},
  cameraBar:{position:'absolute',left:0,right:0,bottom:0,padding:18,backgroundColor:'rgba(17,24,39,.92)'},
  cameraTitle:{color:'#fff',fontSize:20,fontWeight:'900',marginBottom:10},
  muted:{color:'#CBD5E1',fontWeight:'700'},
  btn:{backgroundColor:'#1A73E8',borderRadius:16,padding:16,alignItems:'center',marginTop:12},
  btnText:{fontWeight:'900',color:'#FFFFFF',fontSize:16},
  ghost:{backgroundColor:'transparent',borderWidth:1,borderColor:'#64748B'},
  ghostText:{color:'#FFFFFF'},
  disabled:{opacity:.5},
  disabledText:{color:'#CBD5E1'},
  histPhoto:{width:42,height:54,borderRadius:12,backgroundColor:'#E5E7EB'}
});
