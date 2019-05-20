/**
 * Copyright 2018-2019, Optimizely
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import * as React from 'react'
import { withOptimizely, WithOptimizelyProps } from './withOptimizely'
import { VariationProps } from './Variation'
import { VariableValuesObject } from './client'

export type ChildrenRenderFunction = (
  variableValues: VariableValuesObject,
) => React.ReactNode

type ChildRenderFunction = (variation: string | null) => React.ReactNode

export interface ExperimentProps extends WithOptimizelyProps {
  // TODO add support for overrideUserId
  experiment: string
  autoUpdate?: boolean
  timeout?: number
  children: React.ReactNode | ChildRenderFunction
}

export interface ExperimentState {
  canRender: boolean
  variation: string | null
}

export class Experiment extends React.Component<ExperimentProps, ExperimentState> {
  private optimizelyNotificationId?: number
  private unregisterUserListener: () => void
  private autoUpdate: boolean = false

  constructor(props: ExperimentProps) {
    super(props)

    this.unregisterUserListener = () => {}

    const { autoUpdate, isServerSide, optimizely, experiment } = props
    this.autoUpdate = !!autoUpdate

    if (isServerSide) {
      if (optimizely === null) {
        throw new Error('optimizely prop must be supplied')
      }
      const variation = optimizely.activate(experiment)
      this.state = {
        canRender: true,
        variation,
      }
    } else {
      this.state = {
        canRender: false,
        variation: null,
      }
    }
  }

  componentDidMount() {
    const {
      experiment,
      optimizely,
      optimizelyReadyTimeout,
      isServerSide,
      timeout,
    } = this.props
    if (!optimizely) {
      throw new Error('optimizely prop must be supplied')
    }
    if (isServerSide) {
      return
    }

    // allow overriding of the ready timeout via the `timeout` prop passed to <Experiment />
    let finalReadyTimeout: number | undefined =
      timeout !== undefined ? timeout : optimizelyReadyTimeout

    optimizely.onReady({ timeout: finalReadyTimeout }).then(() => {
      const variation = optimizely.activate(experiment)
      this.setState({
        canRender: true,
        variation,
      })
    })

    if (!this.autoUpdate) {
      return
    }

    this.optimizelyNotificationId = optimizely.notificationCenter.addNotificationListener(
      'OPTIMIZELY_CONFIG_UPDATE',
      () => {
        const variation = optimizely.activate(experiment)
        this.setState({
          variation,
        })
      },
    )

    this.unregisterUserListener = optimizely.onUserUpdate(() => {
      const variation = optimizely.activate(experiment)
      this.setState({
        variation,
      })
    })
  }

  componentWillUnmount() {
    const { optimizely, isServerSide } = this.props
    if (isServerSide || !this.autoUpdate) {
      return
    }
    if (optimizely && this.optimizelyNotificationId) {
      optimizely.notificationCenter.removeNotificationListener(
        this.optimizelyNotificationId,
      )
    }
    this.unregisterUserListener()
  }

  render() {
    const { children } = this.props
    const { variation, canRender } = this.state

    if (!canRender) {
      return null
    }

    if (children != null && typeof children === 'function') {
      return (children as ChildRenderFunction)(variation)
    }

    let match: React.ReactElement<VariationProps> | null = null

    // We use React.Children.forEach instead of React.Children.toArray().find()
    // here because toArray adds keys to all child elements and we do not want
    // to trigger an unmount/remount
    React.Children.forEach(
      this.props.children,
      (child: React.ReactElement<VariationProps>) => {
        if (match || !React.isValidElement(child)) {
          return
        }

        if (child.props.variation) {
          if (variation === child.props.variation) {
            match = child
          }
        } else if (child.props.default) {
          match = child
        }
      },
    )

    return match ? React.cloneElement(match, { variation: variation }) : null
  }
}

export const OptimizelyExperiment = withOptimizely(Experiment)
