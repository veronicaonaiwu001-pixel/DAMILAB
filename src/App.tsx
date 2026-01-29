import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useThemeStore } from '@/stores/theme';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

// Pages
import Home from '@/pages/Home';
import ToolsPage from '@/pages/ToolsPage';
import AuthPage from '@/pages/AuthPage';
import FavoritesPage from '@/pages/FavoritesPage';
import AdminPage from '@/pages/AdminPage';

// Tool Pages
import UUIDGeneratorTool from '@/pages/tools/UUIDGeneratorTool';
import CodeExplainerTool from '@/pages/tools/CodeExplainerTool';
import QRGeneratorTool from '@/pages/tools/QRGeneratorTool';
import PasswordCheckerTool from '@/pages/tools/PasswordCheckerTool';
import Base64Tool from '@/pages/tools/Base64Tool';
import JSONConverterTool from '@/pages/tools/JSONConverterTool';
import ColorPickerTool from '@/pages/tools/ColorPickerTool';
import RegexTesterTool from '@/pages/tools/RegexTesterTool';
import BugFixerTool from '@/pages/tools/BugFixerTool';
import CodeFormatterTool from '@/pages/tools/CodeFormatterTool';
import FakeDataGeneratorTool from '@/pages/tools/FakeDataGeneratorTool';
import IPLookupTool from '@/pages/tools/IPLookupTool';
import EncryptionTool from '@/pages/tools/EncryptionTool';
import JWTDecoderTool from '@/pages/tools/JWTDecoderTool';
import TimezoneConverterTool from '@/pages/tools/TimezoneConverterTool';
import UnitConverterTool from '@/pages/tools/UnitConverterTool';
import PomodoroTool from '@/pages/tools/PomodoroTool';
import GPACalculatorTool from '@/pages/tools/GPACalculatorTool';
import PromptGeneratorTool from '@/pages/tools/PromptGeneratorTool';
import APITesterTool from '@/pages/tools/APITesterTool';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    // Initialize theme
    const savedTheme = localStorage.getItem('theme-storage');
    if (savedTheme) {
      const { state } = JSON.parse(savedTheme);
      setTheme(state.theme);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tools" element={<ToolsPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/history" element={<Navigate to="/favorites" replace />} />

              {/* Tool Routes */}
              <Route path="/tools/uuid-generator" element={<UUIDGeneratorTool />} />
              <Route path="/tools/code-explainer" element={<CodeExplainerTool />} />
              <Route path="/tools/qr-generator" element={<QRGeneratorTool />} />
              <Route path="/tools/password-checker" element={<PasswordCheckerTool />} />
              <Route path="/tools/base64-tool" element={<Base64Tool />} />
              <Route path="/tools/json-converter" element={<JSONConverterTool />} />
              <Route path="/tools/color-picker" element={<ColorPickerTool />} />
              <Route path="/tools/regex-tester" element={<RegexTesterTool />} />
              <Route path="/tools/bug-fixer" element={<BugFixerTool />} />
              <Route path="/tools/code-formatter" element={<CodeFormatterTool />} />
              <Route path="/tools/fake-data-generator" element={<FakeDataGeneratorTool />} />
              <Route path="/tools/ip-lookup" element={<IPLookupTool />} />
              <Route path="/tools/encryption-tool" element={<EncryptionTool />} />
              <Route path="/tools/jwt-decoder" element={<JWTDecoderTool />} />
              <Route path="/tools/timezone-converter" element={<TimezoneConverterTool />} />
              <Route path="/tools/unit-converter" element={<UnitConverterTool />} />
              <Route path="/tools/pomodoro" element={<PomodoroTool />} />
              <Route path="/tools/gpa-calculator" element={<GPACalculatorTool />} />
              <Route path="/tools/prompt-generator" element={<PromptGeneratorTool />} />
              <Route path="/tools/api-tester" element={<APITesterTool />} />

              {/* Placeholder for other tools - redirect to tools page */}
              <Route path="/tools/*" element={<ToolsPage />} />

              {/* 404 */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
        <Toaster position="top-right" richColors closeButton />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
