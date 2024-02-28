export interface MongoInfos {
  version: string;
  gitVersion: string;
  modules: any[];
  allocator: string;
  javascriptEngine: string;
  sysInfo: string;
  versionArray: number[];
  openssl: Openssl;
  buildEnvironment: BuildEnvironment;
  bits: number;
  debug: boolean;
  maxBsonObjectSize: number;
  storageEngines: string[];
  ok: number;
}

export interface Openssl {
  running: string;
  compiled: string;
}

export interface BuildEnvironment {
  distmod: string;
  distarch: string;
  cc: string;
  ccflags: string;
  cxx: string;
  cxxflags: string;
  linkflags: string;
  target_arch: string;
  target_os: string;
  cppdefines: string;
}
