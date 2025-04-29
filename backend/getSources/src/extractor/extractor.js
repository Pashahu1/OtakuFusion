import { HiAnime } from 'aniwatch'
import axios from 'axios'
const hianime = new HiAnime.Scraper()

export const getEpisodes = async (req, res) => {
  try {
    const id = req.params.id

    if (!id) return res.status(404).json({ status: false, message: 'id is required' })
    const episodes = await hianime.getEpisodes(id)

    return res.status(200).json({ status: true, episodes })
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message })
  }
}

export const getServers = async (req, res) => {
  try {
    const episodeId = req.query.episodeId

    if (!episodeId) return res.status(500).json({ status: false, message: 'episodeId is required' })

    const data = await hianime.getEpisodeServers(episodeId)
    return res.status(200).json({ status: true, data })
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message })
  }
}

export const getSources = async (req, res) => {
  try {
    const { episodeId, server = 'hd-1', category = 'sub' } = req.query

    const data = await hianime.getEpisodeSources(episodeId, server, category)
    return res.status(200).json({ status: true, data })
  } catch (error) {
    console.log(error.message)
    return res.status(500).json({ status: false, message: error.message })
  }
}
