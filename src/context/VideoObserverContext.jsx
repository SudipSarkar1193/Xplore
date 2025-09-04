import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";

// Create a context to share the IntersectionObserver instance
const VideoObserverContext = createContext(null);

export function VideoObserverProvider({ children }) {
    const activeVideoRef = useRef(null);
    const [observer, setObserver] = useState(null);
    const playDebounceTimerRef = useRef(null);
    const pendingPlayVideoRef = useRef(null);

    // Instant pause function
    const pauseVideo = useCallback((video) => {
        try {
            if (video && !video.paused) {
                video.pause();
                console.log("Instantly paused video");
            }
        } catch (error) {
            console.warn("Error pausing video:", error);
        }
    }, []);

    // Debounced play function (only for playing, not pausing)
    const schedulePlayVideo = useCallback((video) => {
        // Clear any pending play actions
        if (playDebounceTimerRef.current) {
            clearTimeout(playDebounceTimerRef.current);
        }

        // Store the pending video
        pendingPlayVideoRef.current = video;

        // Debounce only the play action
        playDebounceTimerRef.current = setTimeout(() => {
            const videoToPlay = pendingPlayVideoRef.current;
            
            if (videoToPlay && videoToPlay.readyState >= 2) {
                // Double-check it's still the most visible video
                const rect = videoToPlay.getBoundingClientRect();
                const windowHeight = window.innerHeight;
                const visiblePercent = Math.max(0, Math.min(1, 
                    (Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0)) / rect.height
                ));

                if (visiblePercent > 0.5) {
                    videoToPlay.play().catch((error) => {
                        console.warn("Failed to play video:", error);
                    });
                    activeVideoRef.current = videoToPlay;
                    console.log("Playing video after debounce");
                }
            }
        }, 100); // Shorter debounce for play
    }, []);

    useEffect(() => {
        const newObserver = new IntersectionObserver(
            (entries) => {
                let mostVisibleEntry = null;
                let maxRatio = 0.6; // Higher threshold for playing

                // First pass: instantly pause any video that's no longer visible enough
                entries.forEach(entry => {
                    const video = entry.target;
                    
                    if (!entry.isIntersecting || entry.intersectionRatio < 0.3) {
                        // Instantly pause if video goes below 30% visibility or out of view
                        if (video === activeVideoRef.current) {
                            pauseVideo(video);
                            activeVideoRef.current = null;
                        }
                        // Cancel any pending play for this video
                        if (pendingPlayVideoRef.current === video) {
                            pendingPlayVideoRef.current = null;
                            if (playDebounceTimerRef.current) {
                                clearTimeout(playDebounceTimerRef.current);
                            }
                        }
                    }
                });

                // Second pass: find most visible video for playing
                entries.forEach(entry => {
                    if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
                        maxRatio = entry.intersectionRatio;
                        mostVisibleEntry = entry;
                    }
                });

                // Schedule play for most visible video (only if different from current)
                if (mostVisibleEntry && mostVisibleEntry.target !== activeVideoRef.current) {
                    // Instantly pause current video first
                    if (activeVideoRef.current) {
                        pauseVideo(activeVideoRef.current);
                        activeVideoRef.current = null;
                    }
                    
                    // Schedule new video to play
                    schedulePlayVideo(mostVisibleEntry.target);
                }
            },
            {
                threshold: [0, 0.3, 0.6, 0.8, 1.0], // More granular thresholds
                rootMargin: "0px" // No margin for precise detection
            }
        );

        setObserver(newObserver);

        return () => {
            if (playDebounceTimerRef.current) {
                clearTimeout(playDebounceTimerRef.current);
            }
            newObserver.disconnect();
        };
    }, [pauseVideo, schedulePlayVideo]);

    return (
        <VideoObserverContext.Provider value={observer}>
            {children}
        </VideoObserverContext.Provider>
    );
}

// Hook for registering videos
export function useVideoObserver(videoRef) {
    const observer = useContext(VideoObserverContext);

    useEffect(() => {
        const video = videoRef.current;
        
        if (observer && video) {
            console.log("Observing video:", video.src);
            observer.observe(video);

            return () => {
                console.log("Unobserving video:", video.src);
                observer.unobserve(video);
            };
        }
    }, [observer]);
}