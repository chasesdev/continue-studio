import {
  ConfigPlugin,
  withInfoPlist,
  withDangerousMod,
} from '@expo/config-plugins';
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const withLocalLLM: ConfigPlugin<{ mlcDist?: string }> = (config, props) => {
  // Inject usage descriptions into Info.plist
  config = withInfoPlist(config, (c) => {
    c.modResults.NSMicrophoneUsageDescription ??= 'Voice input for on-device transcription';
    c.modResults.NSCameraUsageDescription ??= 'Capture images for on-device OCR';
    return c;
  });
  // Copy MLC distribution into iOS project as a vendored library
  const dist = props.mlcDist ?? '../../mlc/dist';
  config = withDangerousMod(config, [
    'ios',
    (c) => {
      const dest = join(c.modRequest.platformProjectRoot, 'LocalLLM');
      if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
      cpSync(dist, join(dest, 'dist'), { recursive: true });
      const podspec = `\
Pod::Spec.new do |s|
  s.name     = 'LocalLLM'
  s.version  = '0.1.0'
  s.summary  = 'Local LLM bindings (MLC)'
  s.source   = { :path => '.' }
  s.platform = :ios, '15.0'
  s.vendored_libraries = 'LocalLLM/dist/lib/*.a'
  s.public_header_files = 'LocalLLM/dist/include/**/*.h'
  s.source_files = 'LocalLLM/**/*.{h,m,mm,swift}'
  s.preserve_paths = 'LocalLLM/dist/**/*'
  s.requires_arc = true
end
`;
      writeFileSync(join(dest, 'LocalLLM.podspec'), podspec);
      return c;
    },
  ]);
  return config;
};

export default withLocalLLM;