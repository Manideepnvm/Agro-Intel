const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const userService = {
  async getProfile() {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      const response = await fetch(`${API_URL}/api/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch profile');
      }

      return response.json();
    } catch (error) {
      console.error('Profile fetch error:', error);
      throw error;
    }
  },

  async updateProfile(profileData) {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      // If profile data includes base64 images, compress them
      if (profileData.photoURL && profileData.photoURL.startsWith('data:image')) {
        const compressedImage = await this.compressImage(profileData.photoURL);
        profileData.photoURL = compressedImage;
      }

      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
      }

      return response.json();
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  async uploadProfilePicture(file) {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      // Validate file
      if (!file || !(file instanceof File)) {
        throw new Error('Invalid file');
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload a JPEG, PNG, or GIF image.');
      }

      // Validate file size (1MB max)
      const maxSize = 1 * 1024 * 1024; // 1MB
      if (file.size > maxSize) {
        throw new Error('File is too large. Maximum size is 1MB.');
      }

      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_URL}/api/users/profile/picture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Upload error response:', error);
        throw new Error(error.message || 'Failed to upload profile picture');
      }

      const data = await response.json();
      if (!data.url) {
        throw new Error('No URL returned from server');
      }

      return data.url;
    } catch (error) {
      console.error('Upload profile picture error:', error);
      throw error;
    }
  },

  // Helper function to compress images
  async compressImage(base64String) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Calculate new dimensions (max 800px width/height)
        let width = img.width;
        let height = img.height;
        if (width > height && width > 800) {
          height *= 800 / width;
          width = 800;
        } else if (height > 800) {
          width *= 800 / height;
          height = 800;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = base64String;
    });
  }
}; 