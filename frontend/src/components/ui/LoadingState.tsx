export function LoadingState(props: { label?: string }) {
  return <p>{props.label ?? 'Loading…'}</p>;
}

