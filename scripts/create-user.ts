import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function createUser() {
  const email = "abc@gmail.com";
  const password = "abcd";
  const username = "abc"; // Generated from email
  const displayName = "ABC User"; // Default display name

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username },
        ],
      },
    });

    if (existingUser) {
      console.log("User already exists with email:", email);
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
        displayName,
      },
    });

    console.log("User created successfully!");
    console.log("Email:", user.email);
    console.log("Username:", user.username);
    console.log("Display Name:", user.displayName);
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createUser();
