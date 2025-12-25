"use client";

import {
    AgoraRTCProvider,
    useJoin,
    useLocalCameraTrack,
    useLocalMicrophoneTrack,
    usePublish,
    useRemoteUsers,
    RemoteUser,
    LocalUser
} from "agora-rtc-react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { useState, useEffect, useMemo } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users, Loader2 } from "lucide-react";

interface AgoraMeetingProps {
    channel: string;
    onLeave: () => void;
}

const MeetingInterface = ({ channel, onLeave }: { channel: string; onLeave: () => void }) => {
    // App ID from Env
    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID || "";

    // Hooks
    const { isLoading: isLoadingMic, localMicrophoneTrack } = useLocalMicrophoneTrack();
    const { isLoading: isLoadingCam, localCameraTrack } = useLocalCameraTrack();
    const remoteUsers = useRemoteUsers();

    // Auto Join
    useJoin({ appid: appId, channel: channel, token: null }, true);

    // Auto Publish
    usePublish([localMicrophoneTrack, localCameraTrack]);

    const [micOn, setMicOn] = useState(true);
    const [cameraOn, setCameraOn] = useState(true);

    // Toggle Mic
    useEffect(() => {
        if (localMicrophoneTrack) {
            localMicrophoneTrack.setEnabled(micOn);
        }
    }, [micOn, localMicrophoneTrack]);

    // Toggle Cam
    useEffect(() => {
        if (localCameraTrack) {
            localCameraTrack.setEnabled(cameraOn);
        }
    }, [cameraOn, localCameraTrack]);

    if (!appId) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="text-red-500 font-bold text-2xl mb-4">MISSING CONFIG</div>
                <p className="text-gray-400 mb-4">
                    Environment variable <code className="bg-gray-800 px-2 py-1 rounded">NEXT_PUBLIC_AGORA_APP_ID</code> is missing.
                </p>
                <p className="text-sm text-gray-500">Please add it to .env.local to enable the Neural Link.</p>
                <button
                    onClick={onLeave}
                    className="mt-8 px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded text-white font-mono"
                >
                    RETURN TO BASE
                </button>
            </div>
        );
    }

    if (isLoadingMic || isLoadingCam) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-cyan-500">
                <Loader2 className="w-12 h-12 animate-spin mb-4" />
                <span className="font-mono tracking-widest animate-pulse">INITIALIZING DEVICES...</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-black/90 relative">
            {/* Main Stage - Grid */}
            <div className={`flex-1 p-4 grid gap-4 overflow-hidden ${remoteUsers.length === 0 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>

                {/* Local User */}
                <div className="relative bg-gray-900 rounded-xl overflow-hidden border border-cyan-500/30 group">
                    <LocalUser
                        audioTrack={localMicrophoneTrack}
                        cameraOn={cameraOn}
                        micOn={micOn}
                        videoTrack={localCameraTrack}
                        cover="https://www.agora.io/en/wp-content/uploads/2022/10/3d-spatial-audio-icon.svg"
                    >
                        <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded text-white text-xs font-mono backdrop-blur-md">
                            YOU {micOn ? '' : '(MUTED)'}
                        </div>
                    </LocalUser>
                </div>

                {/* Remote Users */}
                {remoteUsers.map((user) => (
                    <div key={user.uid} className="relative bg-gray-900 rounded-xl overflow-hidden border border-white/10 group">
                        <RemoteUser user={user} cover="https://www.agora.io/en/wp-content/uploads/2022/10/3d-spatial-audio-icon.svg">
                            <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded text-white text-xs font-mono backdrop-blur-md">
                                {user.uid}
                            </div>
                        </RemoteUser>
                    </div>
                ))}

                {remoteUsers.length === 0 && (
                    <div className="flex flex-col items-center justify-center md:col-span-1 border border-dashed border-white/10 rounded-xl p-8 text-gray-500">
                        <div className="animate-pulse flex flex-col items-center">
                            <Users className="w-12 h-12 mb-4 opacity-50" />
                            <span className="font-mono text-sm tracking-widest">WAITING FOR OPERATIVES...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Controls Bar */}
            <div className="h-24 bg-black/80 backdrop-blur-xl border-t border-white/10 flex items-center justify-center gap-6 z-50">
                <button
                    onClick={() => setMicOn(a => !a)}
                    className={`p-4 rounded-full transition-all ${micOn ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-red-500/20 text-red-500 border border-red-500'}`}
                >
                    {micOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                </button>

                <button
                    onClick={onLeave}
                    className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700 transition-all shadow-[0_0_20px_rgba(220,38,38,0.5)] hover:scale-105"
                >
                    <PhoneOff className="w-6 h-6 fill-current" />
                </button>

                <button
                    onClick={() => setCameraOn(a => !a)}
                    className={`p-4 rounded-full transition-all ${cameraOn ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-red-500/20 text-red-500 border border-red-500'}`}
                >
                    {cameraOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                </button>
            </div>
        </div>
    );
};

export default function AgoraMeeting({ channel, onLeave }: AgoraMeetingProps) {
    // Client must be singleton in component tree
    const client = useMemo(() => AgoraRTC.createClient({ mode: "rtc", codec: "vp8" }), []);

    return (
        <div className="w-full h-full text-white">
            <AgoraRTCProvider client={client as any}>
                <MeetingInterface channel={channel} onLeave={onLeave} />
            </AgoraRTCProvider>
        </div>
    );
}
