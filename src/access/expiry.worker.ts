import { entrypoints } from '../config/entrypoints'
import type { AccessService } from './access.service'

export function startExpiryWorker(accessService: AccessService): NodeJS.Timeout {
  const interval = setInterval(async () => {
    try {
      const expiredCount = await accessService.expireDueAccesses()

      if (expiredCount > 0) {
        console.info(`Expired ${expiredCount} access grant(s)`)
      }
    } catch (error) {
      console.error('Failed to expire access grants', error)
    }
  }, entrypoints.worker.expiryCheckIntervalMs)

  interval.unref()

  return interval
}
