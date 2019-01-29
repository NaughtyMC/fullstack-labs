import { OptimizelySDKWrapperConfig, OptimizelySDKWrapper } from '../src/OptimizelySDKWrapper'
import testPublishedSDKWrapper from './testPublishedSdkWrapper'

// The UMD script should have created optimizelySDK as a global variable
declare namespace optimizelySDK {
  function createInstance(config: OptimizelySDKWrapperConfig): OptimizelySDKWrapper
}

describe('UMD build', testPublishedSDKWrapper(optimizelySDK))
