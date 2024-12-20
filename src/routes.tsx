import { Router, Switch, Route } from "wouter";
import Home from "./app/page";
import TradingPage from "./app/trading/page";
import CreateToken from "./app/create-coin/page";
import DashBoard from "./app/dashboard/page";
import ProfilePage from "./app/profile/page";
import Staking from "./app/staking/page";

export function Routes() {
  return (
    <Router>
      <Switch>
        {/* <Route path="/dashboard" component={DashBoard} />
        <Route path="/create-coin" component={CreateToken} />
        <Route path="/vaults" component={Staking} />
        <Route path="/profile/:address" component={ProfilePage} />
        <Route path="/trading/:address" component={TradingPage} />
        <Route path="/" component={Home} /> */}
        <Route path="/" component={Staking} />
      </Switch>
    </Router>
  );
}
