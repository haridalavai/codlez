import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthenticationModule } from './authentication/authentication.module';
import { ConfigModule } from '@nestjs/config';
import { BrowserModule } from './modules/browser/browser.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env`],
      isGlobal: true,
    }),
    AuthenticationModule,
    BrowserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
