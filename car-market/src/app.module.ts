import { MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common'
import { APP_PIPE } from '@nestjs/core'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { UsersModule } from './users/users.module'
import { ReportsModule } from './reports/reports.module'
import { User } from './users/user.entity'
import { Report } from './reports/report.entity'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cookieSession = require('cookie-session')

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          type: 'sqlite',
          database: config.get<string>('DB_NAME'),
          entities: [User, Report],
          synchronize: true,
        }
      },
    }),
    UsersModule,
    ReportsModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
      }),
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        cookieSession({
          keys: ['secretKey'],
        }),
      )
      .forRoutes('*')
  }
}
