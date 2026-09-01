package ratelimit

import (
	"sync"
	"time"
)

type bucket struct{
	count int
	windowEnds time.Time
}

//limiter to track request counts
type Limiter struct{
	mu sync.Mutex
	buckets map[string]*bucket
	limit int
	window time.Duration
}

//new creates limiter allowing limit requests
func New(limit int, window time.Duration)*Limiter{
	return &Limiter{
		buckets: make(map[string]*bucket),
		limit: limit,
		window: window,
	}
}

//resets
func(l *Limiter) Allow(key string) bool{
	l.mu.Lock()
	defer l.mu.Unlock()

	now := time.Now()
	b, exists := l.buckets[key]
	if !exists || now.After(b.windowEnds){
		l.buckets[key] = &bucket{count: 1, windowEnds: now.Add(l.window)}
		return true
	}
	if b.count >= l.limit{
		return false
	}
	b.count++
	return true
}
