import { join } from 'path'
import { Router } from 'express'
import swaggerUi from 'swagger-ui-express'
import { optionalEnv } from '@pep/shared'

const SPEC_URL = "/api/public/docs/openapi.yaml"

export function buildDocsRouter(docsDir: string = optionalEnv('DOCS_DIR', join(process.cwd(), 'docs'))): Router {
	const router = Router()

	router.get('/openapi.yaml', (_req, res) => {
		res.type('application/yaml').sendFile(join(docsDir, 'openapi.yaml'))
	})
	router.get('/postman.json', (_req, res) => {
		res.download(join(docsDir, 'publicapi_testing.json'))
	})
	router.use(swaggerUi.serve)
	router.get('/', swaggerUi.setup(undefined, { swaggerOptions: { url: SPEC_URL } }))
	return (router)
}