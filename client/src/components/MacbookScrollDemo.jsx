import React, { useEffect, useState } from "react";
import { FaEnvelope } from "react-icons/fa";
import { MacbookScroll } from "@/components/ui/macbook-scroll";
import image10 from "../assets/images/10.png"

export default function MacbookScrollDemo() {
    // Check if we're on mobile
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Set up the mobile detection
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        // Initial check
        checkIfMobile();

        // Add resize listener
        window.addEventListener('resize', checkIfMobile);

        // Clean up
        return () => window.removeEventListener('resize', checkIfMobile);
    }, []);

    // Don't render anything on mobile screens - this component won't be visible anyway
    if (isMobile) {
        return null;
    }

    return (
        <div className="overflow-hidden dark:bg-black bg-white w-full">
            <MacbookScroll
                title={
                    <span className="text-5xl font-bold text-gray-800 dark:text-gray-200">
                        <span className="text-[#403BB5]">Let your words travel through time.</span><br />
                        <span className="text-4xl font-medium">Memories that wait for you.</span>
                    </span>
                }
                badge={
                    <div className="bg-indigo-600 h-10 w-10 rounded-full flex items-center justify-center text-white transform -rotate-12">
                        <FaEnvelope className="h-5 w-5" />
                    </div>
                }
                src={image10}
                showGradient={false}
            />
        </div>);
}
