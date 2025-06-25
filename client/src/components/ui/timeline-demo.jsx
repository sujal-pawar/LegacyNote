import React from "react";
import { Timeline } from "./Timeline";
import image2 from "@/assets/images/2.jpg";
import image4 from "@/assets/images/4.png";
import image6 from "../../assets/images/1.jpg";
import image9 from "../../assets/images/9.png";
import image11 from "../../assets/images/11.png";
import image12 from "../../assets/images/12.png";

export default function TimelineDemo() {
    const data = [
        {
            title: "Creation",
            content: (
                <div>
                    <h2 className="mb-4 text-xl text-gray-800 md:text-2xl font-bold dark:text-gray-200">
                        Craft your message. Choose the date. Seal it for the future
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <img
                            src={image4}
                            alt="Creating a message"
                            className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(79,_70,_229,_0.1),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(79,_70,_229,_0.1)] md:h-44 lg:h-60"
                        />
                        <img
                            src={image12}
                            alt="Encryption process"
                            className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(79,_70,_229,_0.1),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(79,_70,_229,_0.1)] md:h-44 lg:h-60"
                        />
                    </div>
                </div>
            ),
        },
        {
            title: "Storage",
            content: (
                <div>
                    <h2 className="mb-4 text-xl text-gray-800 md:text-2xl font-bold dark:text-gray-200">
                        Safely stored and encrypted, your messages are delivered only when the time is right.
                    </h2>                   
                    <div className="grid grid-cols-2 gap-4">
                        <img
                            src={image9}
                            alt="Waiting period"
                            className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(79,_70,_229,_0.1),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(79,_70,_229,_0.1)] md:h-44 lg:h-60"
                        />
                        <img
                            src={image11}
                            alt="Waiting period"
                            className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(79,_70,_229,_0.1),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(79,_70,_229,_0.1)] md:h-44 lg:h-60"
                        />
                    </div>
                </div>
            ),
        },
        {
            title: "Delivery",
            content: (
                <div>
                    <h2 className="mb-4 text-xl text-gray-800 md:text-2xl font-bold dark:text-gray-200">
                        At just the right time, your heartfelt message is delivered securely and meaningfully.
                    </h2>
                    <div className="mb-8 md:overflow-visible overflow-x-auto scrollbar-hide">
                        <div className="flex gap-3 whitespace-nowrap px-1">
                            {[
                                "End-to-end encryption",
                                "Email notification",
                                "Secure access link",                                
                                "Delivery confirmation",                                
                            ].map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-zinc-950 border px-4 py-2 rounded-full shadow-sm"
                                >                                    
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>


                    <div className="grid grid-cols-2 gap-4">
                        <img
                            src={image6}
                            alt="Message delivery"
                            className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(79,_70,_229,_0.1),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(79,_70,_229,_0.1)] md:h-44 lg:h-60"
                        />
                        <img
                            src={image2}
                            alt="Message delivery"
                            className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(79,_70,_229,_0.1),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(79,_70,_229,_0.1)] md:h-44 lg:h-60"
                        />
                    </div>
                </div>
            ),
        },
    ];
    return (
        <div className="relative w-full overflow-clip">
            <Timeline data={data} />
        </div>
    );
}
