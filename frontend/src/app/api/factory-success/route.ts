import { NextResponse } from "next/server";
import { firestore } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

export async function POST(request: Request) {
  try {
    const { uid, message } = await request.json();

    if (!uid) {
      return NextResponse.json(
        { error: "Firebase UID is required" },
        { status: 400 },
      );
    }

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    const userRef = doc(firestore, "users", uid);
    await updateDoc(userRef, {
      factorySuccessMessage: message,
      lastUpdated: new Date().toISOString(),
    });

    return NextResponse.json({
      status: "success",
      message: "User updated successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}
