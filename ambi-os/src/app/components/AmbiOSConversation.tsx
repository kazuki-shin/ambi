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
  const [currentAvatar, setCurrentAvatar] = useState("/avatar-states/idle.png"); // Default avatar
  const [hasError, setHasError] = useState(false); // New state for error

  const conversation = useConversation({
    onConnect: () => {
      console.log("connected");
      setHasError(false); // Reset error on new connection
      // setCurrentAvatar("/avatar-states/listening.png"); // Set in useEffect
    },
    onDisconnect: () => {
      console.log("disconnected");
      // setCurrentAvatar("/avatar-states/idle.png"); // Set in useEffect
    },
    onError: error => {
      console.log(error);
      alert("An error occurred during the conversation");
      setHasError(true);
      // setCurrentAvatar("/avatar-states/error.png"); // Set in useEffect
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

  useEffect(() => {
    // Logic to update avatar based on conversation state
    if (hasError) {
      setCurrentAvatar("/avatar-states/error.png");
    } else if (conversation.status === "connected") {
      if (conversation.isSpeaking) {
        setCurrentAvatar("/avatar-states/speaking.png");
      } else {
        setCurrentAvatar("/avatar-states/listening.png");
      }
    } else { // Disconnected or other states like "connecting", "error" (handled by hasError)
      setCurrentAvatar("/avatar-states/idle.png");
    }
  }, [conversation.status, conversation.isSpeaking, hasError]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    console.log(isMuted ? "Unmuting Ambi OS" : "Muting Ambi OS");
  };

  return (
    <div className={"flex justify-center items-center min-h-screen min-w-full"}> {/* Ensure container takes full viewport */}
      {/* Card and other text elements will be removed or hidden */}
      {/* <Card className={"rounded-3xl"}>
        <CardContent className="pt-6">
          <CardHeader className="p-4">
            <CardTitle className={"text-center text-xl mb-4"}>
              Ambi OS Status
            </CardTitle>
            <div className="text-center text-lg">
              {hasError ? "Error - Please check connection or permissions" :
                conversation.status === "connected"
                ? conversation.isSpeaking
                  ? `Ambi OS is speaking`
                  : "Ambi OS is listening"
                : conversation.status === "connecting"
                ? "Ambi OS Connecting..."
                : "Ambi OS Disconnected"}
            </div>
          </CardHeader>
          <div className={"flex flex-col gap-y-6 items-center"}> */}
            <img
              src={currentAvatar}
              alt="Companion Avatar"
              className="w-screen h-screen object-contain" // Make image fill screen
            />

            {/* {conversation.status === "connected" && !hasError && (
              <Button
                variant={"outline"}
                className={"rounded-full w-full max-w-xs mt-4"} 
                size={"lg"}
                onClick={toggleMute}
              >
                {isMuted ? "Unmute Ambi OS" : "Mute Ambi OS"}
              </Button>
            )} */}
          {/* </div>
        </CardContent>
      </Card> */}
    </div>
  );
} 