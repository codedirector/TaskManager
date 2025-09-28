import './globals.css'
import { ReduxProvider } from "./ReduxProvider";
import Navbar from '@/Components/Navbar';
import { Toaster } from 'react-hot-toast';
export const metadata = {
  title: "My App",
  description: "Task Manager",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar/>
         <Toaster position="top-right" reverseOrder={false} />
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
