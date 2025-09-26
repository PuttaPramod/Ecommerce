import { bootstrapApplication, BootstrapContext } from '@angular/platform-browser';
import { App } from './app/app.component';
import { appConfig as config } from './app/app.config';

const bootstrap = (context: BootstrapContext) => 
  bootstrapApplication(App, config, context);

export default bootstrap;
