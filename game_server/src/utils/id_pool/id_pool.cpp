#include <string>
#include <exception>
#include <cstdlib>
#include "id_pool.h"

#pragma warning(disable: 4244)

#define MULTIPLY_EIGHT(n) (n << 3)
#define DIVIDE_EIGHT(n) (n >> 3)
#define MOD_EIGHT(n) (n & 7)

namespace std {
    typedef exception Exception;
    typedef string String;
}

inline void JS_THROW(v8::Isolate* isolate, const char* msg) {
    isolate->ThrowException(v8::Exception::Error(v8::String::NewFromUtf8(isolate, msg)));
}

inline void JS_THROW(v8::Isolate* isolate, std::String msg) {
    isolate->ThrowException(v8::Exception::Error(v8::String::NewFromUtf8(isolate, msg.c_str())));
}

namespace IdPool
{
    using v8::Boolean;
    using v8::Function;
    using v8::FunctionCallbackInfo;
    using v8::FunctionTemplate;
    using v8::Isolate;
    using v8::Local;
    using v8::Number;
    using v8::Object;
    using v8::Persistent;
    using v8::String;
    using v8::Value;

    Persistent<Function> IdPool::constructor;

    IdPool::IdPool(size_t size):
        _size(size),
        _pool(NULL),
        _reserved(0ull),
        _curFreeId(MIN_ID)
    {
        if (!_size) {
            _size = DEFAULT_POOL_SIZE;
        }

        // _pool = new byte[_size];
        _pool = (byte*)malloc(_size);
    }

    IdPool::~IdPool() {
        // delete[] _pool;
        free(_pool);
    }

    void IdPool::Init(Local<Object> exports)
    {
        Isolate* isolate = exports->GetIsolate();

        // Prepare constructor template
        Local<FunctionTemplate> tpl = FunctionTemplate::New(isolate, New);
        tpl->SetClassName(String::NewFromUtf8(isolate, "IdPool"));
        tpl->InstanceTemplate()->SetInternalFieldCount(4);

        // Prototype
        NODE_SET_PROTOTYPE_METHOD(tpl, "reserve", reserve);
        NODE_SET_PROTOTYPE_METHOD(tpl, "release", release);
        NODE_SET_PROTOTYPE_METHOD(tpl, "clear", clear);
        NODE_SET_PROTOTYPE_METHOD(tpl, "has", has);
        NODE_SET_PROTOTYPE_METHOD(tpl, "size", size);
        NODE_SET_PROTOTYPE_METHOD(tpl, "length", length);

        constructor.Reset(isolate, tpl->GetFunction());
        exports->Set(String::NewFromUtf8(isolate, "IdPool"), tpl->GetFunction());
    }

    void IdPool::New(const FunctionCallbackInfo<Value>& args)
    {
        Isolate* isolate = args.GetIsolate();

        if (args.IsConstructCall()) {
            // Invoked as constructor: `new IdPool(...)`
            double value = args[0]->IsUndefined() || !args[0]->IsNumber()?
                0 : args[0]->NumberValue() / 8;

            if (value > DEFAULT_CTOR_MAX_POSSIBLE_SIZE) {
                JS_THROW(isolate, "Size too large");
                return;
            }

            // ceil
            size_t poolSize = value + (size_t)((size_t)value != value);

            try {
                IdPool* obj = new IdPool(poolSize);
                obj->Wrap(args.This());
                args.GetReturnValue().Set(args.This());
            }
            catch (std::Exception e) {
                JS_THROW(isolate, e.what());
                return;
            }
        } else {
            // Invoked as plain function `IdPool(...)`, turn into construct call.
            const int argc = 1;
            Local<Value> argv[argc] = { args[0] };
            Local<Function> cons = Local<Function>::New(isolate, constructor);
            args.GetReturnValue().Set(cons->NewInstance(argc, argv));
        }
    }

    void IdPool::reserve(const FunctionCallbackInfo<Value>& args)
    {
        Isolate* isolate = args.GetIsolate();
        IdPool* idPool = ObjectWrap::Unwrap<IdPool>(args.Holder());

        if (idPool->_reserved + MIN_ID == MULTIPLY_EIGHT((ull)idPool->_size)) {
            JS_THROW(isolate, "IdPool overflow");
            return;
        }

        if (idPool->_has(idPool->_curFreeId) ||
            idPool->_curFreeId > MULTIPLY_EIGHT(idPool->_size))
        {
            idPool->_curFreeId = idPool->_freeChunks.front();
            idPool->_freeChunks.pop_front();
        }

        idPool->_set(idPool->_curFreeId);

        args.GetReturnValue().Set(Number::New(isolate, (double)idPool->_curFreeId++));
    }

    void IdPool::release(const FunctionCallbackInfo<Value>& args)
    {
        Isolate* isolate = args.GetIsolate();
        IdPool* idPool = ObjectWrap::Unwrap<IdPool>(args.Holder());

        if (args.Length() < 1 || !args[0]->IsNumber()) {
            JS_THROW(isolate, "Invalid arguments. Expected a number");
        }

        ull id = (ull)args[0]->NumberValue();

        if (!idPool->_has(id)) {
            JS_THROW(isolate, "Unexisting id");
        }

        idPool->_unset(id);

        bool hasPrev = idPool->_has(id-1);
        bool hasNext = idPool->_has(id+1);

        if (hasPrev || id == MIN_ID) {
            if (!hasNext) {
                for (auto iter = idPool->_freeChunks.begin();
                     iter != idPool->_freeChunks.end(); iter++)
                {
                    if (*iter == id+1) {
                        // Extend the begining of the free chunk
                        *iter = id;
                        return;
                    }
                }
            }
            // If the prev id was in the array, we need to
            // account for the newly freed chunk's begining.
            // Even if the curFreeId is in the chunk already
            // it will just circle back at some point.
            try {
                idPool->_freeChunks.push_back(id);
            }
            catch (std::Exception e) {
                JS_THROW(isolate, e.what());
            }
        }
    }

    void IdPool::clear(const FunctionCallbackInfo<Value>& args)
    {
        Isolate* isolate = args.GetIsolate();
        IdPool* idPool = ObjectWrap::Unwrap<IdPool>(args.Holder());

        idPool->_clear();
    }

    void IdPool::has(const FunctionCallbackInfo<Value>& args)
    {
        Isolate* isolate = args.GetIsolate();
        IdPool* idPool = ObjectWrap::Unwrap<IdPool>(args.Holder());

        if (args.Length() < 1 || !args[0]->IsNumber()) {
            JS_THROW(isolate, "Invalid arguments. Expected a number");
        }

        ull id = (ull)args[0]->NumberValue();

        args.GetReturnValue().Set(Boolean::New(isolate, idPool->_has(id)));
    }

    void IdPool::size(const FunctionCallbackInfo<Value>& args)
    {
        Isolate* isolate = args.GetIsolate();
        IdPool* idPool = ObjectWrap::Unwrap<IdPool>(args.Holder());

        args.GetReturnValue().Set(Number::New(isolate, idPool->_size));
    }

    void IdPool::length(const FunctionCallbackInfo<Value>& args)
    {
        Isolate* isolate = args.GetIsolate();
        IdPool* idPool = ObjectWrap::Unwrap<IdPool>(args.Holder());

        args.GetReturnValue().Set(Number::New(isolate, idPool->_reserved));
    }

    inline void IdPool::_set(const ull& id) {
        _pool[DIVIDE_EIGHT(id)] |= ((byte)1 << MOD_EIGHT(id));
        _reserved++;
    }

    inline void IdPool::_unset(const ull& id) {
        _pool[DIVIDE_EIGHT(id)] &= ~((byte)1 << MOD_EIGHT(id));
        _reserved--;
    }

    inline void IdPool::_clear() {
        for (size_t i = 0u; i < _size; i++) {
            _pool[i] = 0;
        }

        _reserved = 0ull;
        _curFreeId = MIN_ID;
        _freeChunks.clear();
    }

    inline bool IdPool::_has(const ull& id) const {
        return _pool[DIVIDE_EIGHT(id)] & ((byte)1 << MOD_EIGHT(id));
    }
}

#undef MULTIPLY_EIGHT
#undef DIVIDE_EIGHT
#undef MOD_EIGHT
