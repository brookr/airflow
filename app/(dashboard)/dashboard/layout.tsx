'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Users, Settings, Activity, Menu, Database, ChevronDown } from 'lucide-react';
import { useUser } from "@/lib/auth";
import { WEBFLOW_CONNECTION_ADDED, WEBFLOW_CONNECTION_REMOVED } from './events';

interface Collection {
  collectionId: string;
  name: string;
}

const AI_MODELS = [
  { id: 'o1-mini', name: 'o1-mini' },
  { id: 'o1-preview', name: 'o1-preview' },
  { id: 'gpt-4o', name: 'gpt-4o' },
] as const;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const { user } = useUser();

  const teamId = user?.teamId;

  useEffect(() => {
    if (!teamId) return;

    const fetchCollections = async () => {
      try {
        const response = await fetch(`/api/webflow/connections?teamId=${teamId}`);
        if (response.ok) {
          const data = await response.json();
          setCollections(data.connections);
        }
      } catch (error) {
        console.error('Error fetching collections:', error);
      }
    };

    fetchCollections();

    const handleConnectionChange = () => {
      fetchCollections();
    };

    window.addEventListener(WEBFLOW_CONNECTION_ADDED, handleConnectionChange);
    window.addEventListener(WEBFLOW_CONNECTION_REMOVED, handleConnectionChange);
    
    return () => {
      window.removeEventListener(WEBFLOW_CONNECTION_ADDED, handleConnectionChange);
      window.removeEventListener(WEBFLOW_CONNECTION_REMOVED, handleConnectionChange);
    };
  }, [teamId]);

  const currentModel = searchParams.get('model') || 'o1-mini';

  const navItems = [
    { href: '/dashboard', icon: Users, label: 'Team' },
    { href: '/dashboard/general', icon: Settings, label: 'General' },
    { href: '/dashboard/activity', icon: Activity, label: 'Activity' },
    { href: '/dashboard/webflow-collection', icon: Database, label: 'Webflow Collection', isParent: true },
  ];

  const updateModel = (model: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('model', model);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col min-h-[calc(100dvh-68px)] max-w-7xl mx-auto w-full">
      <div className="lg:hidden flex items-center justify-between bg-white border-b border-gray-200 p-4">
        <div className="flex items-center">
          <span className="font-medium">Settings</span>
        </div>
        <Button
          className="-mr-3"
          variant="ghost"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden h-full">
        <aside
          className={`w-64 bg-white lg:bg-gray-50 border-r border-gray-200 lg:block ${
            isSidebarOpen ? 'block' : 'hidden'
          } lg:relative absolute inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <nav className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4">
              {navItems.map((item) => (
                <div key={item.href}>
                  <Link href={item.href}>
                    <Button
                      variant={pathname === item.href ? 'secondary' : 'ghost'}
                      className={`my-1 w-full justify-start ${
                        pathname === item.href ? 'bg-gray-100' : ''
                      }`}
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                  {item.isParent && collections?.length > 0 && (
                    <ul className="ml-4 mt-2">
                      {collections.map((collection) => (
                        <li key={collection.collectionId} className="mb-1">
                          <Link href={`/dashboard/webflow-collection/${collection.collectionId}`}>
                            <Button variant="ghost" className="w-full justify-start">
                              {collection.name}
                            </Button>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-200">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  AI Model
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {AI_MODELS.find(m => m.id === currentModel)?.name || 'Select Model'}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[calc(100%-2rem)]">
                    {AI_MODELS.map((model) => (
                      <DropdownMenuItem
                        key={model.id}
                        className={currentModel === model.id ? 'bg-accent' : ''}
                        onClick={() => updateModel(model.id)}
                      >
                        {model.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto p-0 lg:p-4">{children}</main>
      </div>
    </div>
  );
}
