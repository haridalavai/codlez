import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthenticationModule } from './authentication/authentication.module';
import { ConfigModule } from '@nestjs/config';
import { TestSuitesModule } from './modules/test-suites/test-suites.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env`],
      isGlobal: true,
    }),
    AuthenticationModule,
    TestSuitesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
