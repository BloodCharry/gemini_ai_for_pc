export const handleApiError = (error: unknown, operation: string): string => {
  if (error instanceof Error) {
    if (error.message.includes('Failed to fetch')) {
      return `Не удалось подключиться к серверу. Проверьте, запущен ли API на ${import.meta.env.VITE_API_URL}.`;
    }
    return `Ошибка ${operation}: ${error.message}`;
  }
  return `Неизвестная ошибка при выполнении операции ${operation}.`;
};