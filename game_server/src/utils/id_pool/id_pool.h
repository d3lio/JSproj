#ifndef _ID_POOL_H_
#define _ID_POOL_H_

#include <list>

#include <node.h>
#include <node_object_wrap.h>

namespace IdPool
{
    using v8::Function;
    using v8::FunctionCallbackInfo;
    using v8::Local;
    using v8::Object;
    using v8::Persistent;
    using v8::Value;

    typedef unsigned char byte;
    typedef unsigned long long ull;

    class IdPool : public node::ObjectWrap
    {
    public: // NODE

        static void Init(Local<Object> exports);

    private: // NODE

        static void New(const FunctionCallbackInfo<Value>& args);
        static Persistent<Function> constructor;

    private: // NODE EXPOSED

        static void reserve(const FunctionCallbackInfo<Value>& args);
        static void release(const FunctionCallbackInfo<Value>& args);
        static void clear(const FunctionCallbackInfo<Value>& args);
        static void has(const FunctionCallbackInfo<Value>& args);
        static void size(const FunctionCallbackInfo<Value>& args);
        static void length(const FunctionCallbackInfo<Value>& args);

    public:

        // (1<<17) B == 128 KiB
        static const size_t DEFAULT_POOL_SIZE = (1u<<17);
        static const size_t DEFAULT_CTOR_MAX_POSSIBLE_SIZE = 0x7FFFFFFF;
        static const ull MIN_ID = 1ull;
        static const ull NULL_ID = 0ull;

    private:

        explicit IdPool(size_t size = DEFAULT_POOL_SIZE);
        ~IdPool();

        inline void _set(const ull& id);
        inline void _unset(const ull& id);
        inline void _clear();
        inline bool _has(const ull& id) const;
        
        size_t _size;
        byte* _pool;
        ull _reserved;
        ull _curFreeId;
        // TODO: refactor with a self made map with key=val that can efficienty change keys
        std::list<ull> _freeChunks;
    };
}

#endif
