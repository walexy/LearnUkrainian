#!/usr/bin/env node

// Language Learner MCP Server
// Exposes language learning progress data for AI tutoring via Claude Desktop

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'

import { getProfileResource } from './resources/profile.js'
import { getWeakAreasResource } from './resources/weak-areas.js'
import { getWordsResource } from './resources/words.js'
import { generateConversationContext } from './tools/context.js'
import { getPracticeRecommendation } from './tools/recommend.js'
import { getConfig } from './api-client.js'

const server = new Server(
  {
    name: 'language-learner',
    version: '1.0.0',
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
)

// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  const config = getConfig()
  const lang = config.defaultLanguage

  return {
    resources: [
      {
        uri: `learner://profile?language=${lang}`,
        name: 'Learner Profile',
        description: 'Summary of learning progress including letters mastered, listening hours, and streak',
        mimeType: 'text/markdown',
      },
      {
        uri: `learner://weakareas?language=${lang}`,
        name: 'Weak Areas',
        description: 'Areas that need practice - struggling letters, low comprehension tiers',
        mimeType: 'text/markdown',
      },
      {
        uri: `learner://words?language=${lang}`,
        name: 'Vocabulary',
        description: 'Acquired words with encounter counts and meanings',
        mimeType: 'text/markdown',
      },
    ],
  }
})

// Read a specific resource
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const url = new URL(request.params.uri)
  const language = url.searchParams.get('language') || undefined

  let content: string

  switch (url.hostname) {
    case 'profile':
      content = await getProfileResource(language)
      break
    case 'weakareas':
      content = await getWeakAreasResource(language)
      break
    case 'words':
      content = await getWordsResource(language)
      break
    default:
      throw new Error(`Unknown resource: ${request.params.uri}`)
  }

  return {
    contents: [
      {
        uri: request.params.uri,
        mimeType: 'text/markdown',
        text: content,
      },
    ],
  }
})

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'generate_conversation_context',
        description: 'Generate full learner context for AI tutoring conversations. Returns detailed progress data to personalize tutoring.',
        inputSchema: {
          type: 'object',
          properties: {
            language: {
              type: 'string',
              description: 'Language code (e.g., "uk" for Ukrainian, "es" for Spanish)',
            },
            focus_area: {
              type: 'string',
              enum: ['alphabet', 'listening', 'vocabulary', 'all'],
              description: 'Area to focus the context on',
            },
          },
        },
      },
      {
        name: 'get_practice_recommendation',
        description: 'Get personalized practice recommendations based on current progress. Suggests what to focus on next.',
        inputSchema: {
          type: 'object',
          properties: {
            language: {
              type: 'string',
              description: 'Language code (e.g., "uk" for Ukrainian)',
            },
            available_minutes: {
              type: 'number',
              description: 'Available practice time in minutes',
            },
          },
        },
      },
    ],
  }
})

// Execute a tool
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  switch (name) {
    case 'generate_conversation_context': {
      const language = args?.language as string | undefined
      const focusArea = args?.focus_area as 'alphabet' | 'listening' | 'vocabulary' | 'all' | undefined
      const result = await generateConversationContext(language, focusArea)
      return {
        content: [{ type: 'text', text: result }],
      }
    }

    case 'get_practice_recommendation': {
      const language = args?.language as string | undefined
      const minutes = args?.available_minutes as number | undefined
      const result = await getPracticeRecommendation(language, minutes)
      return {
        content: [{ type: 'text', text: result }],
      }
    }

    default:
      throw new Error(`Unknown tool: ${name}`)
  }
})

// Start the server
async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('Language Learner MCP server running on stdio')
}

main().catch((error) => {
  console.error('Server error:', error)
  process.exit(1)
})
