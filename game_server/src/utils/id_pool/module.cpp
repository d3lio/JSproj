#include <node.h>
#include "id_pool.h"

namespace IdPool
{
    using v8::Local;
    using v8::Object;

    void ModuleInit(Local<Object> exports) {
        IdPool::Init(exports);
    }

    NODE_MODULE(id_pool, ModuleInit)
}
