"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { customerPortalAction } from "@/lib/payments/actions";
import { useActionState } from "react";
import { TeamDataWithMembers, User, WebflowConnection, ContentfulConnection } from "@/lib/db/schema";
import { removeTeamMember } from "@/app/(login)/actions";
import { InviteTeamMember } from "./invite-team";
import { useUser } from "@/lib/auth";
import {
  addWebflowConnectionAction,
  removeWebflowConnectionAction,
  addContentfulConnectionAction,
  removeContentfulConnectionAction,
} from "./actions";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

type ActionState = {
  error?: string;
  success?: string;
};

export function Settings({ teamData }: { teamData: TeamDataWithMembers }) {
  const [removeState, removeAction, isRemovePending] = useActionState<
    ActionState,
    FormData
  >(removeTeamMember, { error: "", success: "" });
  const { user } = useUser();

  const getUserDisplayName = (user: Pick<User, "id" | "name" | "email">) => {
    return user.name || user.email || "Unknown User";
  };

  const [webflowToken, setWebflowToken] = useState("");
  const [collectionId, setCollectionId] = useState("");
  const [connections, setConnections] = useState<WebflowConnection[]>([]);
  const teamId = teamData.id;
  const [connectionName, setConnectionName] = useState("");

  const [contentfulConnections, setContentfulConnections] = useState<ContentfulConnection[]>([]);
  const [contentfulName, setContentfulName] = useState("");
  const [spaceId, setSpaceId] = useState("");
  const [accessToken, setAccessToken] = useState("");

  useEffect(() => {
    const fetchConnections = async () => {
      const [webflowRes, contentfulRes] = await Promise.all([
        fetch(`/api/webflow/connections?teamId=${teamId}`),
        fetch(`/api/contentful/connections?teamId=${teamId}`)
      ]);
      const [webflowData, contentfulData] = await Promise.all([
        webflowRes.json(),
        contentfulRes.json()
      ]);
      
      setConnections(webflowData.connections);
      setContentfulConnections(contentfulData.connections);
    };

    fetchConnections();
  }, [teamId]);

  const handleAddConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await addWebflowConnectionAction({
      teamId,
      webflowToken,
      collectionId,
      name: connectionName,
    });
    if (result.success) {
      setWebflowToken("");
      setCollectionId("");
      setConnectionName("");
      const response = await fetch(`/api/webflow/connections?teamId=${teamId}`);
      const data = await response.json();
      setConnections(data.connections);
    }
  };

  const handleRemoveConnection = async (connectionId: number) => {
    const result = await removeWebflowConnectionAction(connectionId);
    if (result.success) {
      const response = await fetch(`/api/webflow/connections?teamId=${teamId}`);
      const data = await response.json();
      setConnections(data.connections);
    }
    // Handle errors as needed
  };

  const handleAddContentfulConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await addContentfulConnectionAction({
      teamId,
      spaceId,
      accessToken,
      name: contentfulName,
    });
    
    if (result.success) {
      setContentfulName("");
      setSpaceId("");
      setAccessToken("");
      const response = await fetch(`/api/contentful/connections?teamId=${teamId}`);
      const data = await response.json();
      setContentfulConnections(data.connections);
    }
  };

  const handleRemoveContentfulConnection = async (connectionId: number) => {
    const result = await removeContentfulConnectionAction(connectionId);
    if (result.success) {
      const response = await fetch(`/api/contentful/connections?teamId=${teamId}`);
      const data = await response.json();
      setContentfulConnections(data.connections);
    }
  };

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium mb-6">Team Settings</h1>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Team Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="mb-4 sm:mb-0">
                <p className="font-medium">
                  Current Plan: {teamData.planName || "Free"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {teamData.subscriptionStatus === "active"
                    ? "Billed monthly"
                    : teamData.subscriptionStatus === "trialing"
                    ? "Trial period"
                    : "No active subscription"}
                </p>
              </div>
              <form action={customerPortalAction}>
                <Button type="submit" variant="outline">
                  Manage Subscription
                </Button>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Webflow Integrations</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleAddConnection}
            className="mb-6 flex items-center space-x-4"
          >
            <Input
              type="text"
              value={connectionName}
              onChange={(e) => setConnectionName(e.target.value)}
              placeholder="Connection Name"
              required
              className="flex-1"
            />
            <Input
              type="text"
              value={webflowToken}
              onChange={(e) => setWebflowToken(e.target.value)}
              placeholder="Webflow Token"
              required
              className="flex-1"
            />
            <Input
              type="text"
              value={collectionId}
              onChange={(e) => setCollectionId(e.target.value)}
              placeholder="Collection ID"
              required
              className="flex-1"
            />
            <Button type="submit" variant="outline">
              Add Connection
            </Button>
          </form>

          <h3 className="text-lg font-semibold mb-2">Existing Connections</h3>
          <ul>
            {connections ? (
              connections.map((conn) => (
                <li
                  key={conn.id}
                  className="flex justify-between items-center mb-2"
                >
                  <span>{conn.name}</span>
                  <span>****{conn.webflowToken.slice(-4)}</span>
                  <span>{conn.collectionId}</span>
                  <Button
                    onClick={() => handleRemoveConnection(conn.id)}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                    size="sm"
                  >
                    Remove
                  </Button>
                </li>
              ))
            ) : (
              <p>No connections found</p>
            )}
          </ul>
        </CardContent>
      </Card>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Contentful Integrations</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleAddContentfulConnection}
            className="mb-6 flex items-center space-x-4"
          >
            <Input
              type="text"
              value={contentfulName}
              onChange={(e) => setContentfulName(e.target.value)}
              placeholder="Connection Name"
              required
              className="flex-1"
            />
            <Input
              type="text"
              value={spaceId}
              onChange={(e) => setSpaceId(e.target.value)}
              placeholder="Space ID"
              required
              className="flex-1"
            />
            <Input
              type="text"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="Access Token"
              required
              className="flex-1"
            />
            <Button type="submit" variant="outline">
              Add Connection
            </Button>
          </form>

          <h3 className="text-lg font-semibold mb-2">Existing Connections</h3>
          <ul>
            {contentfulConnections ? (
              contentfulConnections.map((conn) => (
                <li
                  key={conn.id}
                  className="flex justify-between items-center mb-2"
                >
                  <span>{conn.name}</span>
                  <span>****{conn.accessToken.slice(-4)}</span>
                  <span>{conn.spaceId}</span>
                  <Button
                    onClick={() => handleRemoveContentfulConnection(conn.id)}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                    size="sm"
                  >
                    Remove
                  </Button>
                </li>
              ))
            ) : (
              <p>No connections found</p>
            )}
          </ul>
        </CardContent>
      </Card>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {teamData.teamMembers.map((member, index) => (
              <li key={member.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage
                      src={`/placeholder.svg?height=32&width=32`}
                      alt={getUserDisplayName(member.user)}
                    />
                    <AvatarFallback>
                      {getUserDisplayName(member.user)
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {getUserDisplayName(member.user)}
                    </p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {member.role}
                    </p>
                  </div>
                </div>
                {index > 1 ? (
                  <form action={removeAction}>
                    <input type="hidden" name="memberId" value={member.id} />
                    <Button
                      type="submit"
                      variant="outline"
                      size="sm"
                      disabled={isRemovePending}
                    >
                      {isRemovePending ? "Removing..." : "Remove"}
                    </Button>
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
          {removeState?.error && (
            <p className="text-red-500 mt-4">{removeState.error}</p>
          )}
        </CardContent>
      </Card>
      <InviteTeamMember />
    </section>
  );
}
