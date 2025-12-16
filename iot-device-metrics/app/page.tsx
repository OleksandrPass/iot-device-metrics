"use client"

import Link from "next/link";

export default function MainPage() {

    return(
        <div className={'flex flex-col items-center justify-center h-screen bg-gray-100 p-8'}>
            <h1 className="text-3xl font-bold items-center justify-center ">IoT Device Dashboard</h1>
            <button className="mt-10 px-10 py-2 border border-gray-500 text-gray-700 font-semibold rounded-md
            shadow hover:bg-gray-200 transition">
                <Link href="/sign-up">Sign Up</Link> </button>

        </div>
    )
}