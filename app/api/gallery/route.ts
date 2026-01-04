import { NextRequest, NextResponse } from 'next/server';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  addDoc, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// GET: Get all images
export async function GET() {
  try {
    const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const images = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return NextResponse.json({ images });
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}

// POST: Upload new image
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // 1. Upload to Cloudinary
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', file);
    cloudinaryFormData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'blog_update');
    
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dxbztyyio';
    const cloudinaryRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
      { method: 'POST', body: cloudinaryFormData }
    );
    
    if (!cloudinaryRes.ok) {
      throw new Error('Cloudinary upload failed');
    }
    
    const cloudinaryData = await cloudinaryRes.json();
    
    // 2. Save to Firebase
    const docRef = await addDoc(collection(db, 'gallery'), {
      url: cloudinaryData.secure_url,
      publicId: cloudinaryData.public_id,
      name: file.name,
      size: file.size,
      type: file.type,
      createdAt: new Date(),
      format: cloudinaryData.format,
      width: cloudinaryData.width,
      height: cloudinaryData.height
    });
    
    return NextResponse.json({
      id: docRef.id,
      url: cloudinaryData.secure_url,
      publicId: cloudinaryData.public_id,
      name: file.name
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}

// DELETE: Delete image from Firebase and Cloudinary
export async function DELETE(request: NextRequest) {
  try {
    const { imageId, publicId } = await request.json();
    
    if (!imageId) {
      return NextResponse.json(
        { error: 'Image ID required' },
        { status: 400 }
      );
    }
    
    // 1. First delete from Cloudinary (if we have publicId and credentials)
    if (publicId && process.env.CLOUDINARY_API_SECRET) {
      try {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;
        
        if (!cloudName || !apiKey || !apiSecret) {
          console.warn('Cloudinary credentials missing, skipping Cloudinary deletion');
        } else {
          // Create timestamp and signature
          const timestamp = Math.round(Date.now() / 1000);
          const signatureString = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
          
          // Use crypto to create SHA1 hash
          const { createHash } = await import('crypto');
          const signature = createHash('sha1').update(signatureString).digest('hex');
          
          // Create FormData for the request
          const formData = new FormData();
          formData.append('public_id', publicId);
          formData.append('timestamp', timestamp.toString());
          formData.append('api_key', apiKey);
          formData.append('signature', signature);
          
          // Call Cloudinary API to delete
          const deleteRes = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
            {
              method: 'POST',
              body: formData,
            }
          );
          
          const cloudinaryResult = await deleteRes.json();
          
          if (cloudinaryResult.result !== 'ok') {
            console.warn('Cloudinary deletion may have failed:', cloudinaryResult);
          } else {
            console.log('✅ Image deleted from Cloudinary:', publicId);
          }
        }
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary:', cloudinaryError);
        // Continue with Firebase deletion even if Cloudinary fails
      }
    }
    
    // 2. Delete from Firebase
    await deleteDoc(doc(db, 'gallery', imageId));
    
    return NextResponse.json({ 
      success: true,
      message: 'Image deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Delete failed' },
      { status: 500 }
    );
  }
}