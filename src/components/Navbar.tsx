import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { LogOut, Search } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface NavbarProps {
    onSearch?: (query: string) => void;
}

const Navbar = ({ onSearch }: NavbarProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const { logout } = useAuth();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch?.(searchQuery);
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full">
            <div className="container mx-auto px-4 py-3 h-16">
                <div className="flex items-center justify-between h-full gap-4">
                    {/* Left - Brand */}
                    <div className="flex-shrink-0">
                        <Link to="/" className="hover:opacity-80 transition-opacity">
                            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                React Projects
                            </h1>
                        </Link>
                    </div>

                    {/* Center - Search */}
                    <div className="flex-1 max-w-2xl">
                        {onSearch && (
                            <form onSubmit={handleSearch} className="relative">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                    <Input
                                        type="text"
                                        placeholder="Search projects..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 h-10 bg-background border-muted-foreground/20 focus:border-primary dark:bg-muted/40 dark:hover:bg-muted/60 dark:focus:bg-muted/80 transition-colors focus-visible:ring-primary"
                                    />
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Right - Theme Toggle and Logout */}
                    <div className="flex-shrink-0 flex items-center gap-4">
                        <ThemeToggle />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleLogout}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <LogOut className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;