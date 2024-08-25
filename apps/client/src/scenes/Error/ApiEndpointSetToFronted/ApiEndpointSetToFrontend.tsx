import Text from "../../../components/Text";
import s from "../index.module.css";
import { getApiEndpoint } from "../../../services/tools";

export default function ApiEndpointSetToFrontend() {
  return (
    <div className={s.root}>
      <Text element="h1">API Endpoint is not set up correctly</Text>
      <Text className={s.explain}>
        This request should have reached the backend, but was handled by the
        frontend instead.
        <p />
        This is usually because your &nbsp;<code>API_ENDPOINT</code>&nbsp;
        variable points to the frontend instead of the backend. Please
        double-check your configuration.
        <p />
        The current configuration is: <br />
        <code>API_ENDPOINT={getApiEndpoint()}</code>
      </Text>
    </div>
  );
}
