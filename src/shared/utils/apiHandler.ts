/**
 * API 호출을 위한 공통 핸들러
 * loading, error, result 상태를 자동으로 관리합니다
 */
export const createApiHandler = <T = void>(
  setLoading: (loading: boolean) => void,
  setError: (error: string | null) => void,
  setResult: (result: string | null) => void
) => {
  return async (
    apiFunction: () => Promise<T>,
    successMessage: string
  ): Promise<void> => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      await apiFunction();
      setResult(successMessage);
      console.log(successMessage);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 에러';
      setError(errorMessage);
      console.error('에러:', err);
    } finally {
      setLoading(false);
    }
  };
};
