/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_PARENT_PIN?: string;
  readonly VITE_CHAT_ENDPOINT?: string;
  readonly VITE_CHAT_AUTH?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
