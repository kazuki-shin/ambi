"use client";

import { Button } from "@/components/ui/button"; // Assuming this path is correct for ambi-os
import * as React from "react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Assuming this path is correct for ambi-os
import { useConversation } from "@11labs/react"; // This will likely need to be updated if you have a custom hook for Ambi OS
import { cn } from "@/lib/utils"; // Assuming this path is correct for ambi-os

async function requestMicrophonePermission() {
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    return true;
  } catch {
    console.error("Microphone permission denied");
    return false;
  }
}

async function getSignedUrl(): Promise<string> {
  // IMPORTANT: This path needs to exist in ambi-os or be updated.
  const response = await fetch("/api/get-signed-url"); 
  if (!response.ok) {
    throw Error("Failed to get signed url");
  }
  const data = await response.json();
  return data.signedUrl;
}

export function AmbiOSConversation() {
  const [isMuted, setIsMuted] = useState(false);
  const conversation = useConversation({
    onConnect: () => {
      console.log("connected");
    },
    onDisconnect: () => {
      console.log("disconnected");
    },
    onError: error => {
      console.log(error);
      alert("An error occurred during the conversation");
    },
    onMessage: message => {
      console.log(message);
    },
  });

  async function startConversation() {
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      alert("Microphone access was denied. Please enable it in your browser settings.");
      return;
    }
    try {
      const signedUrl = await getSignedUrl();
      await conversation.startSession({ signedUrl });
      console.log("Ambi OS Conversation started automatically.");
    } catch (error) {
      console.error("Failed to start Ambi OS conversation:", error);
      alert("Could not start the Ambi OS conversation. Please check the console for details.");
    }
  }

  useEffect(() => {
    startConversation();

    return () => {
      if (conversation && conversation.status === "connected") {
        conversation.endSession().catch(err => console.error("Error ending session on unmount:", err));
        console.log("Ambi OS Conversation ended on unmount.");
      }
    };
  }, []);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    console.log(isMuted ? "Unmuting Ambi OS" : "Muting Ambi OS");
  };

  return (
    <div className={"flex justify-center items-center gap-x-4"}>
      <Card className={"rounded-3xl"}>
        <CardContent className="pt-6"> {/* Added pt-6 for padding like in many Card examples */}
          <CardHeader className="p-4"> {/* Adjusted padding */}
            <CardTitle className={"text-center text-xl mb-4"}> {/* Adjusted text size and margin */}
              Ambi OS Status
            </CardTitle>
            <div className="text-center text-lg"> {/* Wrapper for status message for better control */}
              {conversation.status === "connected"
                ? conversation.isSpeaking
                  ? `Ambi OS is speaking`
                  : "Ambi OS is listening"
                : "Ambi OS Disconnected"}
            </div>
          </CardHeader>
          <div className={"flex flex-col gap-y-6 items-center"}> {/* Increased gap and centered items */}
            <div
              className={cn(
                "orb my-12 mx-auto w-24 h-24", // Centered orb and defined size
                conversation.status === "connected" && conversation.isSpeaking
                  ? "orb-active animate-orb"
                  : conversation.status === "connected"
                  ? "animate-orb-slow orb-inactive"
                  : "orb-inactive"
              )}
              style={{ // Basic orb styling, assuming CSS for orb, orb-active, animate-orb etc. exists
                borderRadius: '50%',
                backgroundColor: '#ddd', // Default inactive color
                transition: 'background-color 0.5s ease',
              }}
            ></div>

            {conversation.status === "connected" && (
              <Button
                variant={"outline"}
                className={"rounded-full w-full max-w-xs mt-4"} 
                size={"lg"}
                onClick={toggleMute}
              >
                {isMuted ? "Unmute Ambi OS" : "Mute Ambi OS"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 