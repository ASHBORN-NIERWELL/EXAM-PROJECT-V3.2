// app/api/storage/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Define where the file will be saved
const dataDirectory = path.join(process.cwd(), 'data');
const filePath = path.join(dataDirectory, 'db.json');

// Helper to ensure directory exists
function ensureDirectory() {
  if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory);
  }
}

// GET: Read data from the file
export async function GET() {
  ensureDirectory();
  try {
    if (!fs.existsSync(filePath)) {
      // If file doesn't exist, return empty array
      return NextResponse.json({ exams: [] });
    }
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
  }
}

// POST: Write data to the file
export async function POST(request: Request) {
  ensureDirectory();
  try {
    const data = await request.json();
    // Write the data to db.json nicely formatted
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}