import ProtectedLayout from "@/components/ProtectedLayout";
import Navigation from "@/components/Navigation";

export const metadata = {
    title: "Library - StoryGen",
    description: "Your generated books",
};

export default function LibraryLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedLayout>
            <Navigation />
            {children}
        </ProtectedLayout>
    );
}
