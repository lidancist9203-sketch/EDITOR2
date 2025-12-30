export enum ContentType {
  WECHAT = 'WECHAT',
  REDBOOK = 'REDBOOK'
}

export interface WeChatSection {
  type: 'heading' | 'paragraph' | 'image_prompt';
  content: string; // HTML content for text, prompt for image
  style?: string; // Inline CSS style string
}

export interface WeChatArticle {
  title: string;
  sections: WeChatSection[];
}

export interface RedBookPost {
  title: string;
  content: string;
  tags: string[];
  imagePrompts: string[];
}

export interface GeneratedImage {
  prompt: string;
  url: string | null;
  loading: boolean;
  error?: string;
}

export type LoadingState = 'idle' | 'generating_text' | 'generating_images' | 'complete' | 'error';