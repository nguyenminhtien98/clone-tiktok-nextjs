"use client"
import ClientOnly from "./components/ClientOnly";
import MainLayout from "./layouts/MainLayout";
import PostMain from "./components/PostMain";

export default function Home() {
    return (
        <MainLayout>
            <div className="mt-[80px] w-[calc(100%-90px)] max-w-[690px] ml-auto">
                <ClientOnly>
                    <PostMain
                        post={{
                            id:'123',
                            user_id:'456',
                            video_url:'/videos/video_1.mp4',
                            text:'this is some text',
                            created_at:'date here',
                            profile: {
                                user_id:'456',
                                name:"User 1",
                                image: 'htpps://placehold.co/100'
                            }
                        }}
                    ></PostMain>
                </ClientOnly>
            </div>
            <div>home</div>
        </MainLayout>
    );
}