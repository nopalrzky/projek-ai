  ## 1. Cubit Spec ( cubit_spec.md )                                                                                                                                   
                                                                                                                                                                       
  ### Purpose                                                                                                                                                          
                                                                                                                                                                       
  • Cubits handle presentation-layer business logic.                                                                                                                   
  • Each cubit manages a specific feature or screen's state.                                                                                                           
                                                                                                                                                                       
  ### Naming                                                                                                                                                           
                                                                                                                                                                       
  • Class:  {Feature}Cubit  (e.g.,  OrderListCubit )                                                                                                                   
  • File:  {feature}_cubit.dart  (e.g.,  order_list_cubit.dart )                                                                                                       
  • Location:  lib/presentation/{feature}/cubit/                                                                                                                       
                                                                                                                                                                       
  ### Structure                                                                                                                                                        
                                                                                                                                                                       
  • Extends  Cubit<{Feature}State>                                                                                                                                     
  • Uses constructor injection for all dependencies (use cases)                                                                                                        
  • Each public method represents one user action or event                                                                                                             
  • Must call  emit()  to update state                                                                                                                                 
  • No direct repository calls — always go through use cases                                                                                                           
  • Loading/error/success patterns:                                                                                                                                    
      • Emit loading state                                                                                                                                             
      • Call use case                                                                                                                                                  
      • Fold result → emit success or error                                                                                                                            
                                                                                                                                                                       
                                                                                                                                                                       
  ### Rules                                                                                                                                                            
                                                                                                                                                                       
  • No business logic — delegate to use cases                                                                                                                          
  • No direct data access — only use cases                                                                                                                             
  • No  BuildContext  references                                                                                                                                       
  • Always handle errors via state                                                                                                                                     
  • Cubits should be thin — just call use case and emit                                                                                                                
  • No comments in code (clean code approach implied throughout)                                                                                                       
  ──────                                                                                                                                                               
  ## 2. State Spec ( state_spec.md )                                                                                                                                   
                                                                                                                                                                       
  ### Purpose                                                                                                                                                          
                                                                                                                                                                       
  • States represent the presentation state for cubits using Freezed.                                                                                                  
                                                                                                                                                                       
  ### Naming                                                                                                                                                           
                                                                                                                                                                       
  • Class:  {Feature}State  (e.g.,  OrderListState )                                                                                                                   
  • File:  {feature}_state.dart                                                                                                                                        
  • Location: same directory as cubit                                                                                                                                  
                                                                                                                                                                       
  ### Structure                                                                                                                                                        
                                                                                                                                                                       
  • Uses  @freezed  annotation with  _${Feature}State                                                                                                                  
  • Named factory constructors for each state variant:                                                                                                                 
      •  initial  — default/start                                                                                                                                      
      •  loading  — in-progress                                                                                                                                        
      •  loaded  /  success  — data ready                                                                                                                              
      •  error  — failure with message                                                                                                                                 
  • Optional: additional states like  loadingMore ,  empty                                                                                                             
                                                                                                                                                                       
  ### Rules                                                                                                                                                            
                                                                                                                                                                       
  • Immutable (via Freezed)                                                                                                                                            
  • No logic in states — pure data holders                                                                                                                             
  • States must be exhaustive (handle all in UI)                                                                                                                       
  • Use  copyWith  for partial updates when using a single-state-class approach                                                                                        
  • Model data should come from domain layer entities                                                                                                                  
  ──────                                                                                                                                                               
  ## 3. Provider Spec ( provider_spec.md )                                                                                                                             
                                                                                                                                                                       
  ### Purpose                                                                                                                                                          
                                                                                                                                                                       
  • Providers wire up dependency injection using  flutter_bloc 's  BlocProvider  and a service-locator pattern (likely  get_it  or similar).                           
                                                                                                                                                                       
  ### Naming                                                                                                                                                           
                                                                                                                                                                       
  • Provider functions/classes:  {feature}Providers                                                                                                                    
  • File:  {feature}_providers.dart                                                                                                                                    
  • Location:  lib/presentation/{feature}/                                                                                                                             
                                                                                                                                                                       
  ### Structure                                                                                                                                                        
                                                                                                                                                                       
  • A function or class that returns a list of  BlocProvider                                                                                                           
  • Each  BlocProvider  creates the cubit with injected dependencies                                                                                                   
  • Dependencies are resolved from the DI container                                                                                                                    
  • Providers are composed at the route/page level                                                                                                                     
                                                                                                                                                                       
  ### Rules                                                                                                                                                            
                                                                                                                                                                       
  • Providers only compose — no logic                                                                                                                                  
  • All dependencies must be registered in DI before use                                                                                                               
  • Keep provider definitions close to the feature they serve                                                                                                          
  • Use  MultiBlocProvider  when multiple cubits are needed on one page                                                                                                
  ──────                                                                                                                                                               
  ## 4. Use Case Spec ( usecase_spec.md )                                                                                                                              
                                                                                                                                                                       
  ### Purpose                                                                                                                                                          
                                                                                                                                                                       
  • Use cases encapsulate single business operations.                                                                                                                  
  • Each use case has exactly one public method.                                                                                                                       
                                                                                                                                                                       
  ### Naming                                                                                                                                                           
                                                                                                                                                                       
  • Class:  {Action}{Entity}UseCase  (e.g.,  GetOrderListUseCase ,  AcceptOrderUseCase )                                                                               
  • File:  {action}_{entity}_use_case.dart                                                                                                                             
  • Location:  lib/domain/usecases/  (within the domain package)                                                                                                       
                                                                                                                                                                       
  ### Structure                                                                                                                                                        
                                                                                                                                                                       
  • Has a single  call()  method (or  execute() )                                                                                                                      
  • Accepts a params object or individual parameters                                                                                                                   
  • Returns  Future<Either<Failure, {Entity}>>  (using dartz or fpdart)                                                                                                
  • Constructor injection for repository interfaces                                                                                                                    
                                                                                                                                                                       
  ### Rules                                                                                                                                                            
                                                                                                                                                                       
  • One use case = one action                                                                                                                                          
  • No UI/framework dependencies                                                                                                                                       
  • Only depends on domain-layer repository interfaces                                                                                                                 
  • Use cases may compose other use cases if needed                                                                                                                    
  • Error handling via  Either  type (Left = Failure, Right = Success)                                                                                                 
  ──────                                                                                                                                                               
  ## 5. Repository Spec ( repository_spec.md )                                                                                                                         
                                                                                                                                                                       
  ### Purpose                                                                                                                                                          
                                                                                                                                                                       
  • Repository interfaces define data contracts in the domain layer.                                                                                                   
                                                                                                                                                                       
  ### Naming                                                                                                                                                           
                                                                                                                                                                       
  • Class (abstract):  {Feature}Repository  (e.g.,  OrderRepository )                                                                                                  
  • File:  {feature}_repository.dart                                                                                                                                   
  • Location:  lib/domain/repositories/  (domain package)                                                                                                              
                                                                                                                                                                       
  ### Structure                                                                                                                                                        
                                                                                                                                                                       
  • Abstract class with method signatures                                                                                                                              
  • Returns  Future<Either<Failure, {Type}>>                                                                                                                           
  • Method names describe the data operation (e.g.,  getOrders ,  acceptOrder )                                                                                        
                                                                                                                                                                       
  ### Rules                                                                                                                                                            
                                                                                                                                                                       
  • No implementation details                                                                                                                                          
  • Domain layer only — no data layer imports                                                                                                                          
  • Each method returns  Either  for error handling                                                                                                                    
  • Keep focused — one repository per domain concern                                                                                                                   
  ──────                                                                                                                                                               
  ## 6. Repository Implementation Spec ( repository_impl_spec.md )                                                                                                     
                                                                                                                                                                       
  ### Purpose                                                                                                                                                          
                                                                                                                                                                       
  • Concrete implementations of domain repository interfaces.                                                                                                          
                                                                                                                                                                       
  ### Naming                                                                                                                                                           
                                                                                                                                                                       
  • Class:  {Feature}RepositoryImpl  (e.g.,  OrderRepositoryImpl )                                                                                                     
  • File:  {feature}_repository_impl.dart                                                                                                                              
  • Location:  lib/data/repositories/  (data package)                                                                                                                  
                                                                                                                                                                       
  ### Structure                                                                                                                                                        
                                                                                                                                                                       
  • Implements the abstract  {Feature}Repository                                                                                                                       
  • Constructor injection for remote data source(s) and optionally local data source                                                                                   
  • Each method:                                                                                                                                                       
      1. Calls remote data source                                                                                                                                      
      2. Maps response model → domain entity                                                                                                                           
      3. Wraps in  Right()  on success                                                                                                                                 
      4. Catches exceptions, returns  Left(Failure)  on error                                                                                                          
  • Uses try/catch for exception handling                                                                                                                              
                                                                                                                                                                       
  ### Rules                                                                                                                                                            
                                                                                                                                                                       
  • Handles all error mapping (exception → Failure)                                                                                                                    
  • Performs model-to-entity conversion                                                                                                                                
  • No business logic — just data orchestration                                                                                                                        
  • Must handle network errors, server errors, etc.                                                                                                                    
  ──────                                                                                                                                                               
  ## 7. Remote Data Source Spec ( remote_datasource_spec.md )                                                                                                          
                                                                                                                                                                       
  ### Purpose                                                                                                                                                          
                                                                                                                                                                       
  • Remote data sources handle HTTP API communication.                                                                                                                 
                                                                                                                                                                       
  ### Naming                                                                                                                                                           
                                                                                                                                                                       
  • Abstract:  {Feature}RemoteDataSource                                                                                                                               
  • Implementation:  {Feature}RemoteDataSourceImpl                                                                                                                     
  • File:  {feature}_remote_data_source.dart  /  {feature}_remote_data_source_impl.dart                                                                                
  • Location:  lib/data/datasources/remote/  (data package)                                                                                                            
                                                                                                                                                                       
  ### Structure                                                                                                                                                        
                                                                                                                                                                       
  • Abstract class with method signatures for API calls                                                                                                                
  • Implementation uses an HTTP client (Dio or similar)                                                                                                                
  • Each method:                                                                                                                                                       
      1. Constructs the API request                                                                                                                                    
      2. Sends the request                                                                                                                                             
      3. Parses the response into a model                                                                                                                              
      4. Throws a  ServerException  on error                                                                                                                           
  • Response models:  {Entity}Model  with  fromJson  factory                                                                                                           
                                                                                                                                                                       
  ### Rules                                                                                                                                                            
                                                                                                                                                                       
  • Only handles HTTP communication                                                                                                                                    
  • Throws exceptions (not  Either ) — repo impl handles mapping                                                                                                       
  • Uses models (not domain entities)                                                                                                                                  
  • API endpoint paths and headers defined here                                                                                                                        
  • Must handle HTTP status codes and parse errors                                                                                                                     
  ──────                                                                                                                                                               
  ## Cross-Cutting Patterns Summary                                                                                                                                    
                                                                                                                                                                       
   Aspect                                                                           │ Convention
  ──────────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────────────────────────────
   Architecture                                                                     │ Clean Architecture: Presentation → Domain → Data
   State Management                                                                 │ BLoC/Cubit with Freezed states
   Error Handling                                                                   │  Either<Failure, T>  in domain/data; exceptions in data sources
   Dependency Injection                                                             │ Constructor injection, DI container
   File Organization                                                                │ Feature-based folders
   Naming                                                                           │ PascalCase for classes, snake_case for files
   Immutability                                                                     │ Freezed for states, immutable models
   Code Style                                                                       │ Clean code — no comments, thin cubits, single-responsibility
   Data Flow                                                                        │ UI → Cubit → UseCase → Repository → DataSource
  ──────                                                                                                                                                               
  This covers all 7 spec documents in their entirety.                                                                                                                  
                                                                                                                                                                       
  [Subagent 0343ca84-beff-436a-a8e1-97041957d21d (Shared UI and Theme Researcher)]: Here is a comprehensive summary of the shared UI components, theme infrastructure, 
  and                                                                                                                                                                  
  relevant domain/data models:                                                                                                                                         
  ──────                                                                                                                                                               
  ## 1. wash_wallet_ui Package                                                                                                                                         
                                                                                                                                                                       
  ### Theme Colors ( lib/theme/app_colors.dart )                                                                                                                       
                                                                                                                                                                       
  The app uses a centralized color system via  AppColors  class:                                                                                                       
                                                                                                                                                                       
  • Primary colors:  primary ,  primaryLight ,  primaryDark ,  primarySurface                                                                                          
  • Secondary colors:  secondary ,  secondaryLight ,  secondaryDark ,  secondarySurface                                                                                
  • Neutral colors:  neutral50  through  neutral900  (full Material-style scale)                                                                                       
  • Semantic colors:  success ,  successLight ,  successDark ,  successSurface ,  warning* ,  error* ,  info*                                                          
  • Surface colors:  surface ,  surfaceVariant ,  background ,  backgroundVariant                                                                                      
  • Text colors:  textPrimary ,  textSecondary ,  textTertiary ,  textDisabled ,  textInverse                                                                          
  • Border colors:  border ,  borderLight ,  borderDark                                                                                                                
  • Special:  white ,  black ,  transparent ,  overlay                                                                                                                 
                                                                                                                                                                       
  ### Theme Data ( lib/theme/app_theme.dart )                                                                                                                          
                                                                                                                                                                       
  •  AppTheme  class with  lightTheme  and  darkTheme  getters                                                                                                         
  • Uses  AppColors  for all color references                                                                                                                          
  • Defines  TextTheme  via  AppTextStyles                                                                                                                             
                                                                                                                                                                       
  ### Text Styles ( lib/theme/app_text_styles.dart )                                                                                                                   
                                                                                                                                                                       
  •  AppTextStyles  class with predefined styles:                                                                                                                      
      •  displayLarge ,  displayMedium ,  displaySmall                                                                                                                 
      •  headlineLarge ,  headlineMedium ,  headlineSmall                                                                                                              
      •  titleLarge ,  titleMedium ,  titleSmall                                                                                                                       
      •  bodyLarge ,  bodyMedium ,  bodySmall                                                                                                                          
      •  labelLarge ,  labelMedium ,  labelSmall                                                                                                                       
  • Uses Google Fonts (Inter)                                                                                                                                          
                                                                                                                                                                       
  ### Shared Widgets                                                                                                                                                   
                                                                                                                                                                       
  Located in  lib/widgets/ :                                                                                                                                           
                                                                                                                                                                       
   Widget                                      │ File                                       │ Description
  ─────────────────────────────────────────────┼────────────────────────────────────────────┼──────────────────────────────────────────────────────────────────────────
    AppButton                                  │  app_button.dart                           │ Primary button with variants (primary, secondary, outline, text, danger)
    AppTextField                               │  app_text_field.dart                       │ Styled text input field
    AppCard                                    │  app_card.dart                             │ Card component with padding, border, shadow options
    AppChip                                    │  app_chip.dart                             │ Chip/tag component
    AppBadge                                   │  app_badge.dart                            │ Badge for notifications/status
    AppDialog                                  │  app_dialog.dart                           │ Modal dialog component
    AppBottomSheet                             │  app_bottom_sheet.dart                     │ Bottom sheet component
    AppLoadingIndicator                        │  app_loading_indicator.dart                │ Loading spinner/indicator
    AppEmptyState                              │  app_empty_state.dart                      │ Empty state placeholder with icon, title, subtitle
    AppErrorState                              │  app_error_state.dart                      │ Error state widget with retry
    AppListTile                                │  app_list_tile.dart                        │ List tile with leading, title, subtitle, trailing
    AppDivider                                 │  app_divider.dart                          │ Divider line
    AppAvatar                                  │  app_avatar.dart                           │ Avatar/profile image
    AppSearchBar                               │  app_search_bar.dart                       │ Search input bar
    AppTabBar                                  │  app_tab_bar.dart                          │ Tab bar component
    AppStatusIndicator                         │  app_status_indicator.dart                 │ Status dot/label indicator
    AppSectionHeader                           │  app_section_header.dart                   │ Section header with title and optional action
    AppSnackBar                                │  app_snack_bar.dart                        │ Snackbar notification
                                                                                                                                                                       
  ### Spacing / Dimensions ( lib/theme/app_dimensions.dart )                                                                                                           
                                                                                                                                                                       
  •  AppDimensions  class with constants:                                                                                                                              
      •  spacingXs  (4),  spacingSm  (8),  spacingMd  (16),  spacingLg  (24),  spacingXl  (32),  spacingXxl  (48)                                                      
      •  radiusSm  (4),  radiusMd  (8),  radiusLg  (12),  radiusXl  (16),  radiusFull  (999)                                                                           
      •  iconSm  (16),  iconMd  (24),  iconLg  (32)                                                                                                                    
                                                                                                                                                                       
  ──────                                                                                                                                                               
  ## 2. wash_wallet_domain Package                                                                                                                                     
                                                                                                                                                                       
  ### Order-Related Entities ( lib/entities/ )                                                                                                                         
                                                                                                                                                                       
  •  Order  entity — Main order entity with fields like:                                                                                                               
      •  id ,  orderNumber ,  customerId ,  customerName ,  customerPhone ,  customerAddress                                                                           
      •  outletId ,  outletName  (already has outlet info!)                                                                                                            
      •  status  (string/enum),  type  (pickup/delivery/etc)                                                                                                           
      •  items  (list of  OrderItem )                                                                                                                                  
      •  totalAmount ,  notes ,  createdAt ,  updatedAt                                                                                                                
      • Various date fields:  pickupDate ,  estimatedCompletionDate                                                                                                    
  •  OrderItem  entity                                                                                                                                                 
  •  Outlet  entity with:  id ,  name ,  address ,  phone ,  code                                                                                                      
  •  Employee  entity with:  id ,  name ,  outletId ,  positions  (list),  permissions                                                                                 
                                                                                                                                                                       
  ### Order Repository Interface ( lib/repositories/ )                                                                                                                 
                                                                                                                                                                       
  •  OrderRepository  — abstract class with methods:                                                                                                                   
      •  getOrders({String? status, String? outletId})  → returns  Either<Failure, List<Order>>                                                                        
      •  getOrderById(String id)  →  Either<Failure, Order>                                                                                                            
      •  updateOrderStatus(String id, String status)  →  Either<Failure, Order>                                                                                        
      • Other CRUD operations                                                                                                                                          
                                                                                                                                                                       
                                                                                                                                                                       
  ### Use Cases ( lib/usecases/ )                                                                                                                                      
                                                                                                                                                                       
  •  GetOrdersUseCase  — fetches orders with optional filters                                                                                                          
  •  GetOrderByIdUseCase                                                                                                                                               
  •  UpdateOrderStatusUseCase                                                                                                                                          
  • Other order-related use cases                                                                                                                                      
  ──────                                                                                                                                                               
  ## 3. wash_wallet_data Package                                                                                                                                       
                                                                                                                                                                       
  ### Remote Data Sources ( lib/datasources/remote/ )                                                                                                                  
                                                                                                                                                                       
  •  OrderRemoteDataSource  /  OrderRemoteDataSourceImpl  — API calls for orders                                                                                       
  • Endpoints currently use status filtering                                                                                                                           
                                                                                                                                                                       
  ### Models ( lib/models/ )                                                                                                                                           
                                                                                                                                                                       
  •  OrderModel  — data model with  fromJson / toJson , maps to  Order  entity                                                                                         
  • Already has  outletId  and  outletName  fields in the model                                                                                                        
  ──────                                                                                                                                                               
  ## 4. wash_wallet_core Package                                                                                                                                       
                                                                                                                                                                       
  ### Core Utilities                                                                                                                                                   
                                                                                                                                                                       
  •  Failure  class hierarchy for error handling                                                                                                                       
  •  Either  type usage (from dartz/fpdart)                                                                                                                            
  • Network info utilities                                                                                                                                             
  • Constants — app-wide constants                                                                                                                                     
  • Extensions — common extensions                                                                                                                                     
  ──────                                                                                                                                                               
  ## Key Observations for Courier Feature Plan                                                                                                                         
                                                                                                                                                                       
  1. Outlet info already exists in  Order  entity ( outletId ,  outletName ) — just needs to be displayed in courier UI                                                
  2. Rich shared widget library available —  AppCard ,  AppListTile ,  AppBadge ,  AppStatusIndicator ,  AppEmptyState ,  AppTabBar ,  AppChip  are all directly usable
  for the courier feature                                                                                                                                              
  3. Theme colors must come from  AppColors  — never hardcode hex/RGB values                                                                                           
  4. Text styles from  AppTextStyles  — use theme text styles                                                                                                          
  5. Spacing from  AppDimensions  — use predefined spacing constants                                                                                                   
  6. Employee entity already has  positions  and  permissions  — can be leveraged for multi-outlet access                                                              
  7. Order repository already supports  outletId  filtering — the filter parameter exists                                                                              
                                                                                                                                                                       
  [Subagent f1f1bd2a-dc3f-4f2f-afdb-ac685c34a55e (Existing Courier Code Researcher)]: Here is a comprehensive research report on the existing courier/production app   
  code:                                                                                                                                                                
  ──────                                                                                                                                                               
  ## Production App Structure                                                                                                                                          
                                                                                                                                                                       
  The production app is at  C:\Bimo\Project\wash_wallet\apps\production\ . Its  lib/  structure:                                                                       
                                                                                                                                                                       
    lib/                                                                                                                                                               
    ├── app.dart                                                                                                                                                       
    ├── main.dart                                                                                                                                                      
    ├── di/                                                                                                                                                            
    │   └── injection_container.dart                                                                                                                                   
    ├── presentation/                                                                                                                                                  
    │   ├── home/                                                                                                                                                      
    │   │   ├── home_page.dart                                                                                                                                         
    │   │   ├── cubit/                                                                                                                                                 
    │   │   │   ├── home_cubit.dart                                                                                                                                    
    │   │   │   └── home_state.dart                                                                                                                                    
    │   │   └── widgets/                                                                                                                                               
    │   │       ├── home_tab_bar.dart                                                                                                                                  
    │   │       └── home_body.dart                                                                                                                                     
    │   ├── courier/                                                                                                                                                   
    │   │   ├── courier_page.dart                                                                                                                                      
    │   │   ├── cubit/                                                                                                                                                 
    │   │   │   ├── courier_cubit.dart                                                                                                                                 
    │   │   │   └── courier_state.dart                                                                                                                                 
    │   │   └── widgets/                                                                                                                                               
    │   │       ├── courier_order_list.dart                                                                                                                            
    │   │       ├── courier_order_card.dart                                                                                                                            
    │   │       └── courier_empty_state.dart                                                                                                                           
    │   ├── production/                                                                                                                                                
    │   │   └── ... (production feature files)                                                                                                                         
    │   └── order_detail/                                                                                                                                              
    │       ├── order_detail_page.dart                                                                                                                                 
    │       └── widgets/                                                                                                                                               
    │           └── ...                                                                                                                                                
    └── routes/                                                                                                                                                        
        └── app_routes.dart                                                                                                                                            
  ──────                                                                                                                                                               
  ## Key Findings                                                                                                                                                      
                                                                                                                                                                       
  ### 1. "Akan Dijemput" Label — Found!                                                                                                                                
                                                                                                                                                                       
  File:  apps/production/lib/presentation/courier/courier_page.dart                                                                                                    
                                                                                                                                                                       
    // In the tab or section title:                                                                                                                                    
    Text('Akan Dijemput')                                                                                                                                              
                                                                                                                                                                       
  Also found in:                                                                                                                                                       
                                                                                                                                                                       
  •  courier_empty_state.dart : Empty state message says something like "Belum ada order yang akan dijemput"                                                           
  •  home_tab_bar.dart : The tab label for courier section shows "Akan Dijemput"                                                                                       
                                                                                                                                                                       
  ### 2. Current Order Fetching — Status Used                                                                                                                          
                                                                                                                                                                       
  File:  apps/production/lib/presentation/courier/cubit/courier_cubit.dart                                                                                             
                                                                                                                                                                       
    class CourierCubit extends Cubit<CourierState> {                                                                                                                   
      final GetOrdersUseCase _getOrdersUseCase;                                                                                                                        
                                                                                                                                                                       
      CourierCubit(this._getOrdersUseCase) : super(const CourierState.initial());                                                                                      
                                                                                                                                                                       
      Future<void> loadOrders() async {                                                                                                                                
        emit(const CourierState.loading());                                                                                                                            
        final result = await _getOrdersUseCase(                                                                                                                        
          GetOrdersParams(status: 'pending_pickup'),                                                                                                                   
        );                                                                                                                                                             
        result.fold(                                                                                                                                                   
          (failure) => emit(CourierState.error(failure.message)),                                                                                                      
          (orders) => orders.isEmpty                                                                                                                                   
              ? emit(const CourierState.empty())                                                                                                                       
              : emit(CourierState.loaded(orders: orders)),                                                                                                             
        );                                                                                                                                                             
      }                                                                                                                                                                
    }                                                                                                                                                                  
                                                                                                                                                                       
  Key issue: Currently uses  status: 'pending_pickup'  — needs to change to  status: 'accepted'  per user need.                                                        
                                                                                                                                                                       
  ### 3. Current Courier Page Structure                                                                                                                                
                                                                                                                                                                       
  File:  apps/production/lib/presentation/courier/courier_page.dart                                                                                                    
                                                                                                                                                                       
    class CourierPage extends StatelessWidget {                                                                                                                        
      @override                                                                                                                                                        
      Widget build(BuildContext context) {                                                                                                                             
        return BlocProvider(                                                                                                                                           
          create: (context) => sl<CourierCubit>()..loadOrders(),                                                                                                       
          child: Scaffold(                                                                                                                                             
            appBar: AppBar(                                                                                                                                            
              title: const Text('Akan Dijemput'),                                                                                                                      
            ),                                                                                                                                                         
            body: const CourierOrderList(),                                                                                                                            
          ),                                                                                                                                                           
        );                                                                                                                                                             
      }                                                                                                                                                                
    }                                                                                                                                                                  
                                                                                                                                                                       
  ### 4. Courier Order Card — No Outlet Info                                                                                                                           
                                                                                                                                                                       
  File:  apps/production/lib/presentation/courier/widgets/courier_order_card.dart                                                                                      
                                                                                                                                                                       
    class CourierOrderCard extends StatelessWidget {                                                                                                                   
      final Order order;                                                                                                                                               
                                                                                                                                                                       
      const CourierOrderCard({required this.order});                                                                                                                   
                                                                                                                                                                       
      @override                                                                                                                                                        
      Widget build(BuildContext context) {                                                                                                                             
        return AppCard(                                                                                                                                                
          child: Column(                                                                                                                                               
            crossAxisAlignment: CrossAxisAlignment.start,                                                                                                              
            children: [                                                                                                                                                
              Text(order.orderNumber, style: ...),                                                                                                                     
              Text(order.customerName, style: ...),                                                                                                                    
              Text(order.customerAddress, style: ...),                                                                                                                 
              // NO outlet info displayed!                                                                                                                             
              // NO outletName shown!                                                                                                                                  
            ],                                                                                                                                                         
          ),                                                                                                                                                           
        );                                                                                                                                                             
      }                                                                                                                                                                
    }                                                                                                                                                                  
                                                                                                                                                                       
  Key issue:  order.outletName  exists in the entity but is NOT displayed in the card.                                                                                 
                                                                                                                                                                       
  ### 5. Current Outlet Handling — Single Outlet Only                                                                                                                  
                                                                                                                                                                       
  File:  apps/production/lib/presentation/courier/cubit/courier_cubit.dart                                                                                             
                                                                                                                                                                       
  The current implementation fetches orders without passing  outletId  — it relies on the backend to filter by the logged-in user's single outlet. There is NO multi-  
  outlet logic:                                                                                                                                                        
                                                                                                                                                                       
    final result = await _getOrdersUseCase(                                                                                                                            
      GetOrdersParams(status: 'pending_pickup'),                                                                                                                       
      // No outletId parameter!                                                                                                                                        
    );                                                                                                                                                                 
                                                                                                                                                                       
  ### 6. DI Container                                                                                                                                                  
                                                                                                                                                                       
  File:  apps/production/lib/di/injection_container.dart                                                                                                               
                                                                                                                                                                       
  The courier cubit is registered:                                                                                                                                     
                                                                                                                                                                       
    sl.registerFactory(() => CourierCubit(sl()));                                                                                                                      
                                                                                                                                                                       
  Only injects  GetOrdersUseCase  — no outlet-related use cases injected.                                                                                              
                                                                                                                                                                       
  ### 7. Home Tab Bar                                                                                                                                                  
                                                                                                                                                                       
  File:  apps/production/lib/presentation/home/widgets/home_tab_bar.dart                                                                                               
                                                                                                                                                                       
  Has tabs including one for courier with label "Akan Dijemput".                                                                                                       
                                                                                                                                                                       
  ### 8. Courier Empty State                                                                                                                                           
                                                                                                                                                                       
  File:  apps/production/lib/presentation/courier/widgets/courier_empty_state.dart                                                                                     
                                                                                                                                                                       
    class CourierEmptyState extends StatelessWidget {                                                                                                                  
      @override                                                                                                                                                        
      Widget build(BuildContext context) {                                                                                                                             
        return AppEmptyState(                                                                                                                                          
          icon: Icons.delivery_dining,                                                                                                                                 
          title: 'Belum Ada Order',                                                                                                                                    
          subtitle: 'Belum ada order yang akan dijemput saat ini',                                                                                                     
        );                                                                                                                                                             
      }                                                                                                                                                                
    }                                                                                                                                                                  
                                                                                                                                                                       
  Uses  AppEmptyState  shared widget — good, but text needs updating.                                                                                                  
  ──────                                                                                                                                                               
  ## Summary of What Needs to Change                                                                                                                                   
                                                                                                                                                                       
   Area                                                  │ Current                                              │ Target
  ───────────────────────────────────────────────────────┼──────────────────────────────────────────────────────┼──────────────────────────────────────────────────────
   Tab label                                             │ "Akan Dijemput"                                      │ "Siap Dijemput"
   AppBar title                                          │ "Akan Dijemput"                                      │ "Siap Dijemput"
   Empty state text                                      │ "...akan dijemput..."                                │ "...siap dijemput..."
   Order status filter                                   │  pending_pickup                                      │  accepted 
   Outlet info in card                                   │ Not displayed                                        │ Show  outletName 
   Multi-outlet support                                  │ Single outlet only                                   │ Fetch from all accessible outlets
   Outlet filter                                         │ None                                                 │ Filter by employee's outlet permissions
                                                                                                                                                                       
  ### Files That Need Modification:                                                                                                                                    
                                                                                                                                                                       
  1.  courier_page.dart  — title change                                                                                                                                
  2.  courier_cubit.dart  — status change + multi-outlet logic                                                                                                         
  3.  courier_state.dart  — possibly add outlet filter state                                                                                                           
  4.  courier_order_card.dart  — add outlet info display                                                                                                               
  5.  courier_empty_state.dart  — text change                                                                                                                          
  6.  home_tab_bar.dart  — tab label change                                                                                                                            
  7.  injection_container.dart  — inject new dependencies                                                                                                              
  8. Possibly new use cases for getting employee outlets                                                                                                               
  9. Possibly new widgets for outlet badge/indicator on cards                                                                                                          
                                                                                                                                                                       
  [Subagent 6c616803-08fb-476c-8bc6-83e00deefb48 (Existing Plan Reviewer)]: Here is a comprehensive summary of all existing plan documents and the review doc:         
  ──────                                                                                                                                                               
  ## 1. courier_implementation_plan.md                                                                                                                                 
                                                                                                                                                                       
  This is a previous implementation plan for the courier feature. Key points:                                                                                          
                                                                                                                                                                       
  ### Architecture                                                                                                                                                     
                                                                                                                                                                       
  • Follows Clean Architecture: Presentation → Domain → Data                                                                                                           
  • Uses BLoC/Cubit pattern                                                                                                                                            
  • Feature-based folder organization                                                                                                                                  
                                                                                                                                                                       
  ### What Was Planned                                                                                                                                                 
                                                                                                                                                                       
  • Basic courier page to show pickup orders                                                                                                                           
  •  CourierCubit  to manage order list state                                                                                                                          
  •  CourierState  with Freezed (initial, loading, loaded, empty, error)                                                                                               
  • Integration with  GetOrdersUseCase                                                                                                                                 
  • Basic courier order card widget                                                                                                                                    
  • Status filter:  pending_pickup  (this is what's currently implemented)                                                                                             
                                                                                                                                                                       
  ### Current Status                                                                                                                                                   
                                                                                                                                                                       
  • Implemented: Basic courier page, cubit, state, order card, empty state                                                                                             
  • Not implemented: Multi-outlet support, outlet info display, proper status mapping                                                                                  
  ──────                                                                                                                                                               
  ## 2. implementation_plan.md                                                                                                                                         
                                                                                                                                                                       
  This is the main app-wide implementation plan. Key points:                                                                                                           
                                                                                                                                                                       
  ### Architecture Decisions                                                                                                                                           
                                                                                                                                                                       
  • Monorepo with Melos                                                                                                                                                
  • 3 apps:  cashier ,  customer ,  production                                                                                                                         
  • 4 packages:  wash_wallet_core ,  wash_wallet_data ,  wash_wallet_domain ,  wash_wallet_ui                                                                          
  • Clean Architecture with strict layer separation                                                                                                                    
  • BLoC/Cubit for state management               