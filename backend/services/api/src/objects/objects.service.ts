import { Inject, Injectable } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { objects } from '../../schema'
import { DB } from '../database/database.module'
import { CreateObjectDto } from './dto/create-object.dto'

