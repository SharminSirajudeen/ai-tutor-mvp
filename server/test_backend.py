"""
Backend Test Suite

Quick tests to verify the backend is working correctly.
Run with: python test_backend.py
"""

import sys
import os

def test_imports():
    """Test that all modules can be imported."""
    print("Testing imports...")

    try:
        from lib.graphs.socratic_graph import socratic_tutor
        print("  ✓ Socratic graph imported")
    except Exception as e:
        print(f"  ✗ Failed to import graph: {e}")
        return False

    try:
        from lib.tools.automata_builder import AUTOMATA_TOOLS
        print(f"  ✓ Tools imported ({len(AUTOMATA_TOOLS)} tools available)")
    except Exception as e:
        print(f"  ✗ Failed to import tools: {e}")
        return False

    try:
        from streaming import stream_socratic_tutor
        print("  ✓ Streaming module imported")
    except Exception as e:
        print(f"  ✗ Failed to import streaming: {e}")
        return False

    try:
        import main
        print("  ✓ Main FastAPI app imported")
    except Exception as e:
        print(f"  ✗ Failed to import main: {e}")
        return False

    return True


def test_tools():
    """Test that tools work correctly."""
    print("\nTesting tools...")

    try:
        from lib.tools.automata_builder import automata_builder_tool, draw_common_dfa

        # Test automata_builder_tool
        result = automata_builder_tool.invoke({
            "states": [
                {"label": "q0", "is_start": True, "is_accept": False},
                {"label": "q1", "is_start": False, "is_accept": True}
            ],
            "transitions": [
                {"from_state": "q0", "to_state": "q1", "symbol": "a"}
            ],
            "automaton_type": "DFA"
        })

        assert result["success"] == True
        assert len(result["draw_commands"]) > 0
        print("  ✓ automata_builder_tool works")

        # Test draw_common_dfa
        result = draw_common_dfa.invoke({"pattern_name": "even_a"})
        assert result["success"] == True
        assert len(result["draw_commands"]) > 0
        print("  ✓ draw_common_dfa works")

        return True
    except Exception as e:
        print(f"  ✗ Tool test failed: {e}")
        return False


def test_environment():
    """Test environment configuration."""
    print("\nTesting environment...")

    groq_key = os.environ.get("GROQ_API_KEY")
    if not groq_key or groq_key == "placeholder-key-not-set" or groq_key == "YOUR_GROQ_API_KEY":
        print("  ⚠ GROQ_API_KEY not configured (will fail at runtime)")
        print("    Get yours at: https://console.groq.com/keys")
        return False
    else:
        # Mask the key for security
        masked = groq_key[:10] + "..." + groq_key[-4:]
        print(f"  ✓ GROQ_API_KEY configured: {masked}")
        return True


def test_graph_structure():
    """Test that the graph is properly compiled."""
    print("\nTesting graph structure...")

    try:
        from lib.graphs.socratic_graph import socratic_tutor
        from langgraph.graph.state import CompiledStateGraph

        assert isinstance(socratic_tutor, CompiledStateGraph)
        print("  ✓ Graph is properly compiled")

        # Check nodes
        graph_dict = socratic_tutor.get_graph().to_json()
        print(f"  ✓ Graph has {len(socratic_tutor.get_graph().nodes)} nodes")

        return True
    except Exception as e:
        print(f"  ✗ Graph test failed: {e}")
        return False


def main():
    """Run all tests."""
    print("=" * 60)
    print("AI Tutor Backend - Test Suite")
    print("=" * 60)

    results = []

    results.append(("Imports", test_imports()))
    results.append(("Tools", test_tools()))
    results.append(("Environment", test_environment()))
    results.append(("Graph", test_graph_structure()))

    print("\n" + "=" * 60)
    print("Test Results")
    print("=" * 60)

    passed = 0
    failed = 0

    for name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{name:.<40} {status}")
        if result:
            passed += 1
        else:
            failed += 1

    print("=" * 60)
    print(f"Passed: {passed}/{len(results)}")

    if failed > 0:
        print(f"\n{failed} test(s) failed. Please fix before deploying.")
        sys.exit(1)
    else:
        print("\n✓ All tests passed! Backend is ready.")
        print("\nNext steps:")
        print("  1. Run: ./start.sh")
        print("  2. Visit: http://localhost:8000/docs")
        print("  3. Test the /api/v1/chat endpoint")
        sys.exit(0)


if __name__ == "__main__":
    main()
