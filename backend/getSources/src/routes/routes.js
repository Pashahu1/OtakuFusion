import express from 'express'
import { getEpisodes, getServers, getSources } from '../extractor/extractor.js'
import { M3u8Proxy } from '../extractor/proxy.js'

const router = express.Router()

router.get('/proxy', M3u8Proxy)
router.get('/episodes/:id', getEpisodes)

router.get('/servers', getServers)
router.get('/sources', getSources)

export default router
