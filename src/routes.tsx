import { Router, Switch, Route } from 'wouter';
import Home from './app/page';
import TradingPage from './app/trading/[address]/page';
// import { Authenticate } from "./components/authenticate"
// import { Settings } from "./components/account/settings"

export function Routes() {
  return (
    <Router>
      <Switch>
        {/* <Route path="/signin" component={Authenticate} />
        <Route path="/account/settings" component={Settings} /> */}
        {/* many more lines like this ... */}
        <Route path="/trading/:address" component={TradingPage} />
        <Route path="/" component={Home} />
      </Switch>
    </Router>
  );
}
