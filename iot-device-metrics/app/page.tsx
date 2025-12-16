"use client"

import Link from "next/link";

export default function MainPage() {

    return(
        <div>
            <h1 className={'text-gray-800 text-center p-8 text-2xl'}>IoT Device Dashboard</h1>
            <button className={`bg-white hover:bg-gray-100`}> <Link href="/sign-up">Sign Up</Link> </button>

        </div>
    )
}