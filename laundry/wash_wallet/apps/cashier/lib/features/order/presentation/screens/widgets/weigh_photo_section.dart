import 'dart:io';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:wash_wallet_ui/wash_wallet_ui.dart';

class WeighPhotoSection extends StatelessWidget {
  final String? selectedPhotoPath;
  final ValueChanged<String?> onPhotoSelected;

  const WeighPhotoSection({
    super.key,
    required this.selectedPhotoPath,
    required this.onPhotoSelected,
  });

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Foto Bukti Penimbangan',
          style: context.typography.labelMedium.copyWith(
            color: colorScheme.onSurface,
            fontWeight: FontWeight.bold,
          ),
        ),
        SizedBox(height: context.space.sm),
        InkWell(
          onTap: () => _showPicker(context),
          borderRadius: BorderRadius.circular(context.radius.md),
          child: Container(
            height: 160,
            width: double.infinity,
            decoration: BoxDecoration(
              color: colorScheme.surfaceContainerHighest,
              borderRadius: BorderRadius.circular(context.radius.md),
              border: Border.all(color: colorScheme.outlineVariant),
            ),
            child: selectedPhotoPath == null
                ? Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.add_a_photo_outlined,
                        size: 32,
                        color: colorScheme.primary,
                      ),
                      SizedBox(height: context.space.sm),
                      Text(
                        'Tap untuk ambil foto',
                        style: context.typography.bodySmall.copyWith(
                          color: colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  )
                : ClipRRect(
                    borderRadius: BorderRadius.circular(context.radius.md),
                    child: Stack(
                      fit: StackFit.expand,
                      children: [
                        Image.file(File(selectedPhotoPath!), fit: BoxFit.cover),
                        Positioned(
                          top: context.space.sm,
                          right: context.space.sm,
                          child: IconButton.filled(
                            onPressed: () => onPhotoSelected(null),
                            icon: Icon(
                              Icons.close,
                              color: colorScheme.onPrimary,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
          ),
        ),
      ],
    );
  }

  Future<void> _showPicker(BuildContext context) async {
    await showModalBottomSheet<void>(
      context: context,
      builder: (context) => SafeArea(
        child: Wrap(
          children: [
            ListTile(
              leading: const Icon(Icons.camera_alt_outlined),
              title: const Text('Kamera'),
              onTap: () async {
                Navigator.pop(context);
                await _pick(context, ImageSource.camera);
              },
            ),
            ListTile(
              leading: const Icon(Icons.photo_library_outlined),
              title: const Text('Galeri'),
              onTap: () async {
                Navigator.pop(context);
                await _pick(context, ImageSource.gallery);
              },
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _pick(BuildContext context, ImageSource source) async {
    if (source == ImageSource.camera) {
      final status = await Permission.camera.request();
      if (status.isDenied) return;
    }

    final picked = await ImagePicker().pickImage(
      source: source,
      maxWidth: 1080,
      maxHeight: 1080,
      imageQuality: 85,
    );

    if (picked != null) {
      onPhotoSelected(picked.path);
    }
  }
}
