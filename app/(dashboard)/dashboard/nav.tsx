"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Users, Settings, Activity, Menu, Database } from "lucide-react";
import { useUser } from "@/lib/auth";
import {
  WEBFLOW_CONNECTION_ADDED,
  WEBFLOW_CONNECTION_REMOVED,
  CONTENTFUL_CONNECTION_ADDED,
  CONTENTFUL_CONNECTION_REMOVED,
} from "./events";
import { WebflowConnection, ContentfulConnection } from "@/lib/db/schema";

interface NavItem {
  title: string;
  href: string;
  icon?: React.ReactNode;
  items?: NavItem[];
}

export default function DashboardNav() {
  const [items, setItems] = useState<NavItem[]>([]);
  const pathname = usePathname();
  const { user } = useUser();

  const fetchConnections = async () => {
    if (!user?.teamId) return;

    const [webflowRes, contentfulRes] = await Promise.all([
      fetch(`/api/webflow/connections?teamId=${user.teamId}`),
      fetch(`/api/contentful/connections?teamId=${user.teamId}`),
    ]);

    const [webflowData, contentfulData] = await Promise.all([
      webflowRes.json(),
      contentfulRes.json(),
    ]);

    const baseItems: NavItem[] = [
      {
        title: "Overview",
        href: "/dashboard",
        icon: <Database className="w-4 h-4" />,
      },
      {
        title: "Activity",
        href: "/dashboard/activity",
        icon: <Activity className="w-4 h-4" />,
      },
      {
        title: "Settings",
        href: "/dashboard/settings",
        icon: <Settings className="w-4 h-4" />,
      },
    ];

    if (webflowData.connections?.length > 0) {
      baseItems.push({
        title: "Webflow",
        href: "/dashboard/webflow-collection",
        icon: <Menu className="w-4 h-4" />,
        items: webflowData.connections.map((conn: WebflowConnection) => ({
          title: conn.name,
          href: `/dashboard/webflow-collection/${conn.collectionId}`,
        })),
      });
    }

    if (contentfulData.connections?.length > 0) {
      baseItems.push({
        title: "Contentful",
        href: "/dashboard/contentful-space",
        icon: <Database className="w-4 h-4" />,
        items: contentfulData.connections.map((conn: ContentfulConnection) => ({
          title: conn.name,
          href: `/dashboard/contentful-space/${conn.spaceId}`,
        })),
      });
    }

    setItems(baseItems);
  };

  useEffect(() => {
    fetchConnections();

    window.addEventListener(WEBFLOW_CONNECTION_ADDED, fetchConnections);
    window.addEventListener(WEBFLOW_CONNECTION_REMOVED, fetchConnections);
    window.addEventListener(CONTENTFUL_CONNECTION_ADDED, fetchConnections);
    window.addEventListener(CONTENTFUL_CONNECTION_REMOVED, fetchConnections);

    return () => {
      window.removeEventListener(WEBFLOW_CONNECTION_ADDED, fetchConnections);
      window.removeEventListener(WEBFLOW_CONNECTION_REMOVED, fetchConnections);
      window.removeEventListener(CONTENTFUL_CONNECTION_ADDED, fetchConnections);
      window.removeEventListener(
        CONTENTFUL_CONNECTION_REMOVED,
        fetchConnections
      );
    };
  }, [user?.teamId]);

  return (
    <nav className="p-4 space-y-2">
      {items.map((item) => (
        <div key={item.href}>
          <Link href={item.href}>
            <Button
              variant={pathname === item.href ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              {item.icon}
              <span className="ml-2">{item.title}</span>
            </Button>
          </Link>
          {item.items?.map((subItem) => (
            <Link key={subItem.href} href={subItem.href}>
              <Button
                variant={pathname === subItem.href ? "secondary" : "ghost"}
                className="w-full justify-start pl-8 mt-1"
              >
                {subItem.title}
              </Button>
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}
