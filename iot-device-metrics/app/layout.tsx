import React from "react";

interface RootLayoutProps {
    children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="en">
        <body>

        <main>{children}</main>

        </body>
        </html>
    );
}