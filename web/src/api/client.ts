type RequestInterceptor = (config: RequestInit) => RequestInit | Promise<RequestInit>
type ResponseInterceptor = (response: Response) => Response | Promise<Response>
type ErrorInterceptor = (error: Error) => Error | Promise<Error>

class ApiClient {
  private requestInterceptors: RequestInterceptor[] = []
  private responseInterceptors: ResponseInterceptor[] = []
  private errorInterceptors: ErrorInterceptor[] = []

  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor)
  }

  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor)
  }

  addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor)
  }

  private async applyRequestInterceptors(config: RequestInit): Promise<RequestInit> {
    let result = config
    for (const interceptor of this.requestInterceptors) {
      result = await interceptor(result)
    }
    return result
  }

  private async applyResponseInterceptors(response: Response): Promise<Response> {
    let result = response
    for (const interceptor of this.responseInterceptors) {
      result = await interceptor(result)
    }
    return result
  }

  private async applyErrorInterceptors(error: Error): Promise<Error> {
    let result = error
    for (const interceptor of this.errorInterceptors) {
      result = await interceptor(result)
    }
    return result
  }

  async fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    try {
      const config = await this.applyRequestInterceptors(init || {})
      const response = await window.fetch(input, config)
      const interceptedResponse = await this.applyResponseInterceptors(response)
      return interceptedResponse
    } catch (error) {
      const interceptedError = await this.applyErrorInterceptors(
        error instanceof Error ? error : new Error(String(error))
      )
      throw interceptedError
    }
  }
}

export const apiClient = new ApiClient()
