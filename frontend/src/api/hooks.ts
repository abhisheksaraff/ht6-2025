import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messageApi, contentApi, createMessage, createSendMessageRequest } from './services';
import type { SendMessageRequest, Conversation } from './types';

// Query keys for caching
export const queryKeys = {
  conversations: ['conversations'] as const,
  conversation: (id: string) => ['conversation', id] as const,
  messages: (conversationId: string) => ['messages', conversationId] as const,
  content: (id: string) => ['content', id] as const,
};

// Hooks for conversations
export const useConversations = () => {
  return useQuery({
    queryKey: queryKeys.conversations,
    queryFn: messageApi.getConversations,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useConversation = (conversationId: string) => {
  return useQuery({
    queryKey: queryKeys.conversation(conversationId),
    queryFn: () => messageApi.getConversation(conversationId),
    enabled: !!conversationId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hooks for messages
export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SendMessageRequest) => messageApi.sendMessage(request),
    onSuccess: () => {
      // Invalidate conversations list to refresh it
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
      
      // Optimistically update the conversation if we have a conversationId
      // This would need to be implemented based on your conversation management
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
    },
  });
};

// Hooks for content
export const useSendContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: contentApi.sendContent,
    onSuccess: (response) => {
      // Invalidate content queries
      queryClient.invalidateQueries({ queryKey: queryKeys.content(response.id) });
    },
    onError: (error) => {
      console.error('Failed to send content:', error);
    },
  });
};

export const useContent = (contentId: string) => {
  return useQuery({
    queryKey: queryKeys.content(contentId),
    queryFn: () => contentApi.getContent(contentId),
    enabled: !!contentId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Conversation management hooks
export const useCreateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: messageApi.createConversation,
    onSuccess: (newConversation) => {
      // Add the new conversation to the cache
      queryClient.setQueryData(
        queryKeys.conversations,
        (oldData: Conversation[] | undefined) => {
          return oldData ? [newConversation, ...oldData] : [newConversation];
        }
      );
    },
  });
};

export const useUpdateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Conversation> }) =>
      messageApi.updateConversation(id, data),
    onSuccess: (updatedConversation) => {
      // Update the conversation in cache
      queryClient.setQueryData(
        queryKeys.conversation(updatedConversation.id),
        updatedConversation
      );
      
      // Update in conversations list
      queryClient.setQueryData(
        queryKeys.conversations,
        (oldData: Conversation[] | undefined) => {
          if (!oldData) return [updatedConversation];
          return oldData.map(conv => 
            conv.id === updatedConversation.id ? updatedConversation : conv
          );
        }
      );
    },
  });
};

export const useDeleteConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: messageApi.deleteConversation,
    onSuccess: (_, conversationId) => {
      // Remove from conversations list
      queryClient.setQueryData(
        queryKeys.conversations,
        (oldData: Conversation[] | undefined) => {
          return oldData?.filter(conv => conv.id !== conversationId) || [];
        }
      );
      
      // Remove the conversation cache
      queryClient.removeQueries({ queryKey: queryKeys.conversation(conversationId) });
    },
  });
};

// Utility hook for creating and sending messages
export const useSendMessageWithContext = () => {
  const sendMessageMutation = useSendMessage();

  const sendMessage = async (
    content: string,
    conversationId?: string
  ) => {
    const request = createSendMessageRequest(content);
    
    try {
      const response = await sendMessageMutation.mutateAsync(request);
      
      // Create the assistant message from response
      const assistantMessage = createMessage(
        response.content,
        'assistant'
      );

      return {
        userMessage: createMessage(content, 'user'),
        assistantMessage,
        conversationId,
      };
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  };

  return {
    sendMessage,
    isLoading: sendMessageMutation.isPending,
    error: sendMessageMutation.error,
  };
}; 