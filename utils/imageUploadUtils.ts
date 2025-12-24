
import { Platform } from 'react-native';

export interface UploadImageOptions {
  uri: string;
  fieldName?: string;
  fileName?: string;
  additionalData?: Record<string, string>;
}

export interface UploadResult {
  success: boolean;
  data?: any;
  error?: string;
}

export const createImageFormData = (
  uri: string,
  fieldName: string = 'photo',
  fileName: string = 'photo.jpg',
  additionalData?: Record<string, string>
): FormData => {
  console.log(`[Upload] Creating FormData for: ${uri}`);

  const formData = new FormData();

  const file: any = {
    uri: uri,
    type: 'image/jpeg',
    name: fileName,
  };

  formData.append(fieldName, file);

  if (additionalData) {
    Object.keys(additionalData).forEach((key) => {
      formData.append(key, additionalData[key]);
    });
  }

  console.log(`[Upload] FormData created with field: ${fieldName}`);

  return formData;
};

export const uploadImage = async (
  url: string,
  options: UploadImageOptions
): Promise<UploadResult> => {
  const {
    uri,
    fieldName = 'photo',
    fileName = 'photo.jpg',
    additionalData,
  } = options;

  try {
   
    console.log('URL:', url);
    console.log('URI:', uri);
    console.log('Field Name:', fieldName);
    console.log('File Name:', fileName);

    // Créer FormData
    const formData = createImageFormData(uri, fieldName, fileName, additionalData);

    console.log('Sending POST request...');

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    console.log('Response Status:', response.status);
    console.log('Response OK:', response.ok);

    const responseText = await response.text();
    console.log('Response Text:', responseText.substring(0, 200));

    if (!response.ok) {
    
      console.error('Status:', response.status);
      console.error('Response:', responseText);

      return {
        success: false,
        error: `Upload failed with status ${response.status}: ${responseText}`,
      };
    }

    // Parser JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      data = { message: responseText };
    }

   
    console.log('Data:', JSON.stringify(data, null, 2));

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error('Error:', error);
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);

    return {
      success: false,
      error: error.message || 'Upload failed',
    };
  }
};
